module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios|@testing-library/).*/',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
