const path = require("path");
module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: path.resolve(__dirname, "tsconfig.eslint.json"),
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "error",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
