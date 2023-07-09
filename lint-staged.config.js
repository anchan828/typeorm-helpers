module.exports = {
  "*.{ts}": ["eslint --fix", "prettier --write", "git add"],
  "*.{js,json,yml,yaml,md}": ["prettier --write", "git add"],
};
