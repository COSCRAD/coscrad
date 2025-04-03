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

        describe(`when there are out-of-alphabet symbols`, () => {
            describe(`when the out-of-alphabet symbol occurs in the middle of the word`, () => {
                describe(`darlʔulh`, () => {
                    it(`should return the correct result`, () => {
                        const input = `darlʔulh`;

                        const result = tokenizer.tokenize(input);

                        const { symbols } = result[0];

                        expect(symbols).toEqual(['d', 'a', 'r', 'l', 'ʔ', 'u', 'lh']);
                    });
                });
            });

            describe(`when the out-of-alphabet symbol occurs at the end of a word`, () => {
                describe(`tlibec`, () => {
                    it(`should return the expected result`, () => {
                        const input = `tlibec`;

                        const result = tokenizer.tokenize(input);

                        const { symbols } = result[0];

                        expect(symbols).toEqual(['tl', 'i', 'b', 'e', 'c']);
                    });
                });
            });
        });

        describe(`when there is punctuation`, () => {
            describe(`dechen-ya`, () => {
                it(`should return the expected result`, () => {
                    const input = 'dechen-yaz';

                    const result = tokenizer.tokenize(input);

                    const { symbols } = result[0];

                    expect(symbols).toEqual(['d', 'e', 'ch', 'e', 'n', '-', 'y', 'a', 'z']);
                });
            });
        });
    });

    describe(`when the text includes multiple words`, () => {
        it(`should return the expected result`, () => {
            const input = `"Nenden nendan hant’ih!?" Robert Smith-Jones han.`;

            const result = tokenizer.tokenize(input);

            expect(result).toHaveLength(6);

            expect(result[0].symbols).toEqual(['"', 'n', 'e', 'n', 'd', 'e', 'n']);
            expect(result[1].symbols).toEqual(['n', 'e', 'n', 'd', 'a', 'n']);
            expect(result[2].symbols).toEqual(['h', 'a', 'n', 't’', 'i', 'h', '!', '?', '"']);
            expect(result[3].symbols).toEqual(['r', 'o', 'b', 'e', 'r', 't']);
            expect(result[4].symbols).toEqual([
                's',
                'm',
                'i',
                't',
                'h',
                '-',
                'j',
                'o',
                'n',
                'e',
                's',
            ]);
            expect(result[5].symbols).toEqual(['h', 'a', 'n', '.']);
        });
    });
});
