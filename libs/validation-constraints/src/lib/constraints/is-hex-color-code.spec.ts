import { isHexColorCode } from './is-hex-color-code';

const assertValidValue = (input: string) => {
    it(`should return true`, () => {
        const result = isHexColorCode(input);

        expect(result).toBe(true);
    });
};

const assertInvalidValue = (input: unknown) => {
    it(`should return false`, () => {
        const result = isHexColorCode(input);

        expect(result).toBe(false);
    });
};

describe(`isHexColorCode`, () => {
    describe(`when the input is not a string`, () => {
        describe(`1`, () => {
            assertInvalidValue(1);
        });

        describe(`5.5`, () => {
            assertInvalidValue(5.5);
        });

        describe('{ foo: 2 }', () => {
            assertInvalidValue({ foo: 2 });
        });

        describe('true', () => {
            assertInvalidValue(true);
        });

        describe('false', () => {
            assertInvalidValue(false);
        });

        describe('null', () => {
            assertInvalidValue(null);
        });

        describe('undefined', () => {
            assertInvalidValue(undefined);
        });

        describe('function', () => {
            assertInvalidValue(() => 2);
        });
    });

    describe(`when the input is a string`, () => {
        describe(`when the input is a valid hex color code`, () => {
            describe('#FF5733', () => {
                assertValidValue('#FF5733');
            });

            describe('#fff', () => {
                assertValidValue('#fff');
            });
        });

        describe(`when the input is not a valid hex color code`, () => {
            describe('#GF5809', () => {
                assertInvalidValue('#GF5809');
            });

            describe(`#Z12`, () => {
                assertInvalidValue(`#Z12`);
            });

            describe('FF5809', () => {
                assertInvalidValue('FF5809');
            });

            describe('fff', () => {
                assertInvalidValue('fff');
            });

            describe('empty string', () => {
                assertInvalidValue('');
            });

            describe('#a (too short)', () => {
                assertInvalidValue('#a');
            });

            describe('#FFF123c (too long()', () => {
                assertInvalidValue('#FFF123c');
            });
        });
    });
});
