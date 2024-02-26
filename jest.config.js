module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  testEnvironment: 'jsdom',
};
