import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNumberWithinRange } from './is-number-within-range';

type Args = [number, [number, number]];

const argsThatShouldSatisfyTheConstraint: Args[] = [
    [1, [0, 1]],
    [1, [0, 4]],
    [1, [1, 2]],
    [55, [-3, 99]],
    [2.345, [2.345, 2.347]],
    [-1.09, [-1.1, -1.08]],
    [100, [-Infinity, Infinity]],
    [4.4, [4.4, 4.4]],
];

const argsThatShouldNotSatisfyTheConstraint: Args[] = [
    [1, [0, 0]],
    [20, [21, 99]],
    [2.05, [2.0500000001, 2.99]],
    [Infinity, [-2e10, 3e10]],
    [-Infinity, [-2e10, 3e10]],
];

const buildInputAndRangeDescription = (input: number, range: [number, number]): string =>
    `input: ${input}, range: [${range[0]},${range[1]}]`;

describe('isNonEmptyObject', () => {
    describe('when the value satisfies the constraint', () => {
        argsThatShouldSatisfyTheConstraint.forEach(([input, range]) => {
            const predicate = (input: unknown) => isNumberWithinRange(input, range);

            const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(predicate);

            describe(buildInputAndRangeDescription(input, range), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(input);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        argsThatShouldNotSatisfyTheConstraint.forEach(([input, range]) => {
            const predicate = (input: unknown) => isNumberWithinRange(input, range);

            const assertConstraintFailure = assertConstraintFailsForPredicate(predicate);

            describe(buildInputAndRangeDescription(input, range), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(input);
                });
            });
        });
    });

    describe('when the provided range is invalid', () => {
        it('should throw', () => {
            const act = () => isNumberWithinRange(2.2, [4.4, 3.3]);

            expect(act).toThrow();
        });
    });
});
