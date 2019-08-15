const base = require("../../jest.config.base");
module.exports = {
  ...base,
  coverageDirectory: "../e2e-coverage",
  testMatch: ["<rootDir>/*.spec-e2e.ts"],
};
