type BooleanFunction = (args: unknown) => boolean;

// notOfType

export default (wrappedFunction: BooleanFunction): BooleanFunction =>
    (args) =>
        !wrappedFunction(args);
