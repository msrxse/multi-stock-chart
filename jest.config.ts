export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // process `*.tsx` files with `ts-jest`
  },
  rootDir: 'src',
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__ mocks __/fileMock.js',
    '\\.(css|less)$': '<rootDir>/test/__mocks__/styleMock.js',
    '^d3-(.*)$': `<rootDir>../node_modules/d3-$1/dist/d3-$1`,
  },
};
