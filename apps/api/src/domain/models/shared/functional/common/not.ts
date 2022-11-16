type BooleanFunction = (args: unknown) => boolean;

// TODO make this work as an anti-type guard notOfType
// TODO Break out into a low-level functional library to be shared with frontend
export default (wrappedFunction: BooleanFunction): BooleanFunction =>
    (args) =>
        !wrappedFunction(args);
