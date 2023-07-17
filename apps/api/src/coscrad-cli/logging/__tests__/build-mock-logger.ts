interface BuildMockLoggerOptions {
    isEnabled?: boolean;
}

export const buildMockLogger = (options?: BuildMockLoggerOptions) => {
    const isEnabled = options ? options.isEnabled : false;

    const implementation = isEnabled
        ? (msg: string) => {
              console.log(msg);
          }
        : // eslint-disable-next-line
          () => {};

    return {
        log: jest.fn().mockImplementation(implementation),
    };
};
