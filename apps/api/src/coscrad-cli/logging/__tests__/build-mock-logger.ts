export const buildMockLogger = () => ({
    log: jest.fn().mockImplementation(),
});
