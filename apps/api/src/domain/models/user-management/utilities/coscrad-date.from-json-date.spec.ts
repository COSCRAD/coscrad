import { InternalError } from '../../../../lib/errors/InternalError';
import { CoscradDate, Month } from './coscrad-date.entity';

describe(`CoscradDate.fromJsonString`, () => {
    describe(`when given a valid date`, () => {
        it(`should return the expected result`, () => {
            // Mon Sep 26 2022 17:06:34 GMT-0700 (Pacific Daylight Time)
            const timestamp = 1664237194356;

            const result = CoscradDate.fromUnixTimestamp(timestamp);

            expect(result).not.toBeInstanceOf(InternalError);

            const { month, year, day } = result as CoscradDate;

            expect(month).toBe(Month.September);

            expect(year).toBe(2022);

            expect(day).toBe(26);
        });
    });
});
