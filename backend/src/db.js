const { Pool } = require("pg");

const CREATE_LEADS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    contact VARCHAR(120) NOT NULL,
    company VARCHAR(120),
    message_source VARCHAR(64) NOT NULL DEFAULT 'landing_page',
    status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
    pdf_original_name VARCHAR(255),
    pdf_storage_path TEXT,
    pdf_size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    admin_notes TEXT,
    submit_ip_hash VARCHAR(64),
    user_agent TEXT,
    file_purged_at TIMESTAMPTZ
  );
`;

const CREATE_LEADS_INDEXES_SQL = `
  CREATE INDEX IF NOT EXISTS leads_status_created_at_idx ON leads (status, created_at DESC);
  CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
`;

function createPool(config) {
  return new Pool({
    connectionString: config.databaseUrl
  });
}

async function initializeDatabase(pool) {
  await pool.query(CREATE_LEADS_TABLE_SQL);
  await pool.query(CREATE_LEADS_INDEXES_SQL);
}

function mapLeadRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    company: row.company,
    messageSource: row.message_source,
    status: row.status,
    pdfOriginalName: row.pdf_original_name,
    pdfStoragePath: row.pdf_storage_path,
    pdfSizeBytes: row.pdf_size_bytes == null ? null : Number(row.pdf_size_bytes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
    adminNotes: row.admin_notes,
    submitIpHash: row.submit_ip_hash,
    userAgent: row.user_agent,
    filePurgedAt: row.file_purged_at
  };
}

class PostgresLeadRepository {
  constructor(pool, pageSize) {
    this.pool = pool;
    this.pageSize = pageSize;
  }

  async createLead(lead) {
    const result = await this.pool.query(
      `
        INSERT INTO leads (
          id,
          name,
          contact,
          company,
          message_source,
          status,
          pdf_original_name,
          pdf_storage_path,
          pdf_size_bytes,
          admin_notes,
          submit_ip_hash,
          user_agent
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
      [
        lead.id,
        lead.name,
        lead.contact,
        lead.company,
        lead.messageSource,
        lead.status,
        lead.pdfOriginalName,
        lead.pdfStoragePath,
        lead.pdfSizeBytes,
        lead.adminNotes,
        lead.submitIpHash,
        lead.userAgent
      ]
    );

    return mapLeadRow(result.rows[0]);
  }

  async listLeads({ status, dateFrom, dateTo, page }) {
    const filters = [];
    const values = [];

    if (status) {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }

    if (dateFrom) {
      values.push(dateFrom);
      filters.push(`created_at >= $${values.length}`);
    }

    if (dateTo) {
      values.push(dateTo);
      filters.push(`created_at < $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const offset = (page - 1) * this.pageSize;
    values.push(this.pageSize, offset);

    const listPromise = this.pool.query(
      `
        SELECT *
        FROM leads
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}
      `,
      values
    );

    const countValues = values.slice(0, values.length - 2);
    const countPromise = this.pool.query(
      `
        SELECT COUNT(*)::INT AS total
        FROM leads
        ${whereClause}
      `,
      countValues
    );

    const [listResult, countResult] = await Promise.all([listPromise, countPromise]);

    return {
      page,
      pageSize: this.pageSize,
      total: countResult.rows[0]?.total || 0,
      items: listResult.rows.map(mapLeadRow)
    };
  }

  async getLeadById(id) {
    const result = await this.pool.query(
      `
        SELECT *
        FROM leads
        WHERE id = $1
      `,
      [id]
    );

    return mapLeadRow(result.rows[0]);
  }

  async updateLead(id, updates) {
    const result = await this.pool.query(
      `
        UPDATE leads
        SET
          status = $2,
          admin_notes = $3,
          updated_at = NOW(),
          closed_at = CASE WHEN $2 = 'closed' THEN NOW() ELSE NULL END
        WHERE id = $1
        RETURNING *
      `,
      [id, updates.status, updates.adminNotes]
    );

    return mapLeadRow(result.rows[0]);
  }

  async listLeadsForRetention(cutoffDate) {
    const result = await this.pool.query(
      `
        SELECT *
        FROM leads
        WHERE pdf_storage_path IS NOT NULL
          AND created_at < $1
      `,
      [cutoffDate]
    );

    return result.rows.map(mapLeadRow);
  }

  async markFilePurged(id) {
    const result = await this.pool.query(
      `
        UPDATE leads
        SET
          pdf_storage_path = NULL,
          file_purged_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    return mapLeadRow(result.rows[0]);
  }
}

module.exports = {
  createPool,
  initializeDatabase,
  PostgresLeadRepository
};
