import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { CoscradDate, Month } from './coscrad-date.entity';
import { InvalidDateError } from './invalid-date.error';

describe('CoscradDate.parseString', () => {
    describe('when the input is valid', () => {
        it('should succeed', () => {
            const validInput = '2020-11-12';

            const result = CoscradDate.parseString(validInput);

            expect(result).toBeInstanceOf(CoscradDate);

            const date = result as CoscradDate;

            expect(date.day).toBe(12);

            expect(date.month).toBe(Month.November);

            expect(date.year).toBe(2020);
        });
    });

    describe('when the input is invalid', () => {
        describe('when there is only one dash', () => {
            it('should return the expected error', () => {
                const invalidInput = '2020-11';

                const result = CoscradDate.parseString(invalidInput);

                assertErrorAsExpected(result, new InvalidDateError(invalidInput));
            });
        });

        describe('when a date volates the leap year rules', () => {
            it('should return the expected error', () => {
                const invalidInput = '1905-02-29';

                const result = CoscradDate.parseString(invalidInput);

                assertErrorAsExpected(result, new InternalError('finish this'));
            });
        });
    });
});
