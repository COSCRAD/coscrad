import { ChilcotinTokenizer } from './chilcotin-tokenizer';

const tokenizer = new ChilcotinTokenizer();

describe(`ChilcotinTokenizer`, () => {
    describe(`when the text includes a single word`, () => {
        describe(`when each letter is one unicode symbol`, () => {
            describe(`when there are no special symbols`, () => {
                describe(`detan`, () => {
                    it(`should return the expected tokens`, () => {
                        const input = 'detan';

                        const result = tokenizer.tokenize(input);

                        expect(result).toHaveLength(1);

                        const { text, isPunct, isSpace, isStop, symbols } = result[0];

                        expect(text).toBe(input);

                        expect(isPunct).toBe(false);

                        expect(isSpace).toBe(false);

                        expect(isStop).toBe(false);

                        expect(symbols).toEqual(['d', 'e', 't', 'a', 'n']);
                    });
                });
            });

            describe(`when there are special symbols`, () => {
                describe(`ŝetan`, () => {
                    it(`should return the expected result`, () => {
                        const input = `ŝetan`;

                        const result = tokenizer.tokenize(input);

                        const { symbols } = result[0];

                        expect(symbols).toEqual(['ŝ', 'e', 't', 'a', 'n']);
                    });
                });
            });
        });

        describe(`when some letters require multiple unicode symbols`, () => {
            describe(`teyatlɨg`, () => {
                it(`should return the correct result`, () => {
                    const input = `teyatlɨg`;

                    const result = tokenizer.tokenize(input);

                    const { symbols } = result[0];

                    expect(symbols).toEqual(['t', 'e', 'y', 'a', 'tl', 'ɨ', 'g']);
                });
            });
        });
    });

    describe(`when the text includes multiple words`, () => {
        it.todo(`should have a test`);
    });
});
