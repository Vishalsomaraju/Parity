module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/tests/prodSimulation.test.ts'],
  collectCoverageFrom: [
    'src/services/scoring/**/*.ts',
    'src/services/comparison/**/*.ts',
    'src/services/qa/**/*.ts',
    'src/services/synthesis/**/*.ts',
    'src/services/segmentation/**/*.ts',
    'src/utils/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 85,
      lines: 88,
      statements: 85,
    },
  },
};
