module.exports = {
  collectCoverage: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testPathIgnorePatterns: ["/node_modules/", "/example/", "/lib/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
