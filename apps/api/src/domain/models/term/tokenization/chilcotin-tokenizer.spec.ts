import { ChilcotinTokenizer } from './chilcotin-tokenizer';
import { Token } from './tokenizer.interface';

const tokenizer = new ChilcotinTokenizer();

const assertTokenizationResult = (result: Token[], expecteds: Token[] | string[][]) => {
    if (expecteds.length === 0) {
        throw new Error(`You must include an expectation for assertTokenizationResult`);
    }

    const test = expecteds[0];

    if (Array.isArray(test)) {
        const comparison = result.map(({ characters }) => characters.map(({ text }) => text));

        expect(comparison).toEqual(expecteds);
    } else {
        // we have a full array of tokens
        expect(result).toEqual(expecteds);
    }
};

describe(`ChilcotinTokenizer`, () => {
    describe(`when the text includes a single word`, () => {
        describe(`when each letter is one unicode symbol`, () => {
            describe(`when there are no special symbols`, () => {
                describe(`detan`, () => {
                    it(`should return the expected tokens`, () => {
                        const input = 'detan';

                        const result = tokenizer.tokenize(input);

                        expect(result).toHaveLength(1);

                        const { text, isPunct, isSpace, isStop } = result[0];

                        expect(text).toBe(input);

                        expect(isPunct).toBe(false);

                        expect(isSpace).toBe(false);

                        expect(isStop).toBe(false);

                        assertTokenizationResult(result, [['d', 'e', 't', 'a', 'n']]);
                    });
                });
            });

            describe(`when there are special symbols`, () => {
                describe(`ŝetan`, () => {
                    it(`should return the expected result`, () => {
                        const input = `ŝetan`;

                        const result = tokenizer.tokenize(input);

                        assertTokenizationResult(result, [['ŝ', 'e', 't', 'a', 'n']]);
                    });
                });
            });
        });

        describe(`when some letters require multiple unicode symbols`, () => {
            describe(`teyatlɨg`, () => {
                it(`should return the correct result`, () => {
                    const input = `teyatlɨg`;

                    const result = tokenizer.tokenize(input);

                    assertTokenizationResult(result, [['t', 'e', 'y', 'a', 'tl', 'ɨ', 'g']]);
                });
            });
        });

        describe(`when there are out-of-alphabet symbols`, () => {
            describe(`when the out-of-alphabet symbol occurs in the middle of the word`, () => {
                describe(`darlʔulh`, () => {
                    it(`should return the correct result`, () => {
                        const input = `darlʔulh`;

                        const result = tokenizer.tokenize(input);

                        assertTokenizationResult(result, [['d', 'a', 'r', 'l', 'ʔ', 'u', 'lh']]);
                    });
                });
            });

            describe(`when the out-of-alphabet symbol occurs at the end of a word`, () => {
                describe(`tlibec`, () => {
                    it(`should return the expected result`, () => {
                        const input = `tlibec`;

                        const result = tokenizer.tokenize(input);

                        assertTokenizationResult(result, [['tl', 'i', 'b', 'e', 'c']]);
                    });
                });
            });
        });

        describe(`when there is punctuation`, () => {
            describe(`dechen-ya`, () => {
                it(`should return the expected result`, () => {
                    const input = 'dechen-yaz';

                    const result = tokenizer.tokenize(input);

                    assertTokenizationResult(result, [
                        ['d', 'e', 'ch', 'e', 'n', '-', 'y', 'a', 'z'],
                    ]);
                });
            });
        });
    });

    describe(`when the text includes multiple words`, () => {
        it(`should return the expected result`, () => {
            const input = `"Nenden nendan hant’ih!?" Robert Smith-Jones han.`;

            const result = tokenizer.tokenize(input);

            assertTokenizationResult(result, [
                ['"', 'n', 'e', 'n', 'd', 'e', 'n'],
                ['n', 'e', 'n', 'd', 'a', 'n'],
                ['h', 'a', 'n', 't’', 'i', 'h', '!', '?', '"'],
                ['r', 'o', 'b', 'e', 'r', 't'],
                ['s', 'm', 'i', 't', 'h', '-', 'j', 'o', 'n', 'e', 's'],
                ['h', 'a', 'n', '.'],
            ]);
        });
    });
});
