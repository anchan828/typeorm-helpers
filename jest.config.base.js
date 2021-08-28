module.exports = {
  preset: "ts-jest",
  rootDir: "src",
  coverageDirectory: "../coverage",
  coverageReporters: ["text-summary", "json-summary", "lcov", "text", "clover"],
  testEnvironment: "node",
  verbose: true,
  silent: false,
  testMatch: ["<rootDir>/**/*.spec.ts"],
};
