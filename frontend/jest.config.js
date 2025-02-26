module.exports = {
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    transformIgnorePatterns: [
      "node_modules/(?!@testing-library/dom|axios)"
    ],
    testEnvironment: "jsdom",
    moduleFileExtensions: ["js", "jsx", "json", "node"],
  };
  