import { LanguageCode } from '@coscrad/api-interfaces';
import { parseLanguageCode } from './parse-language-code-from-query';

describe(`parseLanguageCode`, () => {
    describe(`when a valid language code is contained in the query`, () => {
        describe(`en`, () => {
            it(`should return the expected result`, () => {
                const result = parseLanguageCode(`{en} foobarbaz`);

                expect(result).toBe(LanguageCode.English);
            });
        });

        describe(`clc`, () => {
            it(`should return the expected result`, () => {
                const result = parseLanguageCode(`{clc} foobarbaz`);

                expect(result).toBe(LanguageCode.Chilcotin);
            });
        });

        describe(`hai`, () => {
            it(`should return the expected result`, () => {
                const result = parseLanguageCode(`{hai} foobarbaz`);

                expect(result).toBe(LanguageCode.Haida);
            });
        });
    });

    describe(`when the input does not include a language code`, () => {
        describe(`when the input is a simple string with no brackets`, () => {
            const result = parseLanguageCode('english is an amazingly difficult language to learn');

            expect(result).toBeUndefined();
        });
    });
});
