type BooleanFunction = (args: unknown) => boolean;

// TODO make this work as an anti-type guard notOfType

export default (wrappedFunction: BooleanFunction): BooleanFunction =>
    (args) =>
        !wrappedFunction(args);
