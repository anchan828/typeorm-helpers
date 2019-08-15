module.exports = {
  "*.{ts}": ["eslint --fix", "git add"],
  "*.{js,json,yml,yaml,md}": ["prettier --write", "git add"],
};
