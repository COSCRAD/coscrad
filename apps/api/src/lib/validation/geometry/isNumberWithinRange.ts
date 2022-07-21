import isFiniteNumber from '../../utilities/isFiniteNumber';

type Options = {
    inclusiveAtStart: boolean;

    inclusiveAtEnd: boolean;
};

const defaultOptions: Options = {
    inclusiveAtStart: true,

    inclusiveAtEnd: true,
};

/**
 * By default, the endpoints are included (i.e. the interval is considered closed
 * on both ends). To change this behaviour, provide options.
 */
export default (
    input: number,
    [start, end]: [number, number],
    options: Partial<Options> = {}
): boolean => {
    if (!isFiniteNumber(input)) return false;

    const { inclusiveAtStart, inclusiveAtEnd } = {
        ...defaultOptions,
        ...options,
    };

    const doesRespectStartBound = inclusiveAtStart
        ? (input) => input >= start
        : (input) => input > start;

    const doesRespectEndBound = inclusiveAtEnd ? (input) => input <= end : (input) => input < end;

    return doesRespectStartBound(input) && doesRespectEndBound(input);
};
