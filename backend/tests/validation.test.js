const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateLeadPayload,
  validateLeadUpdate
} = require("../src/utils/validation");

test("validateLeadPayload trims and accepts valid input", () => {
  const result = validateLeadPayload({
    name: "  Ivan  ",
    contact: "  @ivan  ",
    company: "  Smetika  ",
    website: ""
  });

  assert.deepEqual(result, {
    name: "Ivan",
    contact: "@ivan",
    company: "Smetika"
  });
});

test("validateLeadPayload rejects spam honeypot", () => {
  assert.throws(
    () =>
      validateLeadPayload({
        name: "Ivan",
        contact: "@ivan",
        website: "bot"
      }),
    /Spam check failed/
  );
});

test("validateLeadUpdate validates supported statuses", () => {
  const result = validateLeadUpdate({
    status: "in_progress",
    adminNotes: "checked"
  });

  assert.equal(result.status, "in_progress");
  assert.equal(result.adminNotes, "checked");
});
