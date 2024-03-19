import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { CoscradDate, Month } from './coscrad-date.entity';
import { DayOfMonthTooLargeError } from './day-of-month-too-large.error';
import { NotALeapYearError } from './not-a-leap-year.error';

const assertIsValidDate = (year: number, month: Month, day: number): void => {
    const result = new CoscradDate({
        year,
        month,
        day,
    }).validateComplexInvariants();

    expect(result).toEqual([]);
};

/**
 * Note that the complex invariant validation is only responsible for ensuring
 * that the date is consistent with the month and year, including leap year
 * rules. The range of allowed values for a year and date (0-31) are constrained
 * at the level of simple validation (COSCRAD data schema validation).
 */
describe(`CoscradDate.validateComplexInvariants`, () => {
    describe(`when the date is valid`, () => {
        describe(`January 1, 2023`, () => {
            it(`should return no errors`, () => {
                assertIsValidDate(2023, Month.January, 1);
            });
        });
    });

    describe(`when the date is invalid`, () => {
        describe(`when february 29th is provided with a non leap year (2023)`, () => {
            it(`should return the expected errors`, () => {
                const targetNonLeapYear = 2023;

                const result = new CoscradDate({
                    year: targetNonLeapYear,
                    month: Month.February,
                    day: 29,
                }).validateComplexInvariants();

                expect(result).toHaveLength(1);

                assertErrorAsExpected(result[0], new NotALeapYearError(targetNonLeapYear));
            });
        });

        describe(`when the date is larger than the maximum allowed`, () => {
            describe(`January 32, 1980`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1980,
                        month: Month.January,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });

            describe(`February 30, 1979`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1979,
                        month: Month.February,
                        day: 30,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 28));
                });
            });

            describe(`March 32, 1994`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1994,
                        month: Month.March,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });

            describe(`April 31, 1990`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1990,
                        month: Month.April,
                        day: 31,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 30));
                });
            });

            describe(`May 32, 1959`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1959,
                        month: Month.May,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });

            describe(`June 31, 1959`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1933,
                        month: Month.June,
                        day: 31,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 30));
                });
            });

            describe(`July 32, 1976`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1976,
                        month: Month.July,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });

            describe(`August 32, 2004`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 2004,
                        month: Month.August,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });

            describe(`September 31, 2001`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 2001,
                        month: Month.September,
                        day: 31,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 30));
                });
            });

            describe(`October 32, 1964`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1964,
                        month: Month.October,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });

            describe(`November 31, 1955`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1955,
                        month: Month.November,
                        day: 31,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 30));
                });
            });

            describe(`December 32, 1885`, () => {
                it('should fail with the expected errors', () => {
                    const date = new CoscradDate({
                        year: 1885,
                        month: Month.December,
                        day: 32,
                    });

                    const result = date.validateComplexInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(result[0], new DayOfMonthTooLargeError(date, 31));
                });
            });
        });
    });
});
