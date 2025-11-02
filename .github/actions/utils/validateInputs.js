// .github/actions/utils/validateInputs.js

// Try to import safely (avoid errors when running locally)
let core;
try {
  core = require("@actions/core");
} catch {
  core = {
    setFailed: console.error,
    info: console.log,
  };
}

/**
 * Validate and parse grace hours from environment variables.
 * Ensures it's a positive number, otherwise falls back to default (48).
 */
function getValidatedGraceHours() {
  const raw = process.env.LOW_EFFORT_GRACE_HOURS;
  const parsed = parseFloat(raw);
  if (isNaN(parsed) || parsed <= 0) {
    core.info(`⚠️ Invalid LOW_EFFORT_GRACE_HOURS='${raw}', defaulting to 48`);
    return 48;
  }
  core.info(`✅ Using LOW_EFFORT_GRACE_HOURS=${parsed}`);
  return parsed;
}

module.exports = { getValidatedGraceHours };
