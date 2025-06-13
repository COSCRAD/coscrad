import { Token } from '../interfaces/tokenizer.interface';
import { ChilcotinTokenizer } from './chilcotin-tokenizer';

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

/**
 * Sometimes caps come through as isolated characters in text.
 * ŝ (U+015D)

    HTML Entity:	
    &#349;
    &#x15D;
    &scirc;

    UTF-8 Encoding:	0xC5 0x9D
    UTF-16 Encoding:	0x015D
    UTF-32 Encoding:	0x0000015D
    Uppercase Character:	Ŝ (U+015C) [1]
    Decomposition:	s (U+0073) - ◌̂ (U+0302)[1]
 * 
 * With Diacritic "◌̂" (U+0302) 
 * 
 * ŵ (U+0175)
    HTML Entity:	

    &#373;
    &#x175;
    &wcirc;

    UTF-8 Encoding:	0xC5 0xB5
    UTF-16 Encoding:	0x0175
    UTF-32 Encoding:	0x00000175
    Uppercase Character:	Ŵ (U+0174) [1]
    Decomposition:	w (U+0077) - ◌̂ (U+0302)[1] 
 
 * 
 * ẑ (U+1E91)
 * HTML Entity:	
    &#7825;
    &#x1E91;

    UTF-8 Encoding:	0xE1 0xBA 0x91
    UTF-16 Encoding:	0x1E91
    UTF-32 Encoding:	0x00001E91
    Uppercase Character:	Ẑ (U+1E90) [1]
    Decomposition:	z (U+007A) - ◌̂ (U+0302)[1]
 * 
 * See [here](https://www.compart.com/en/unicode/U+015D)
 */
const loneSurrogateCap = '̂'; // === String.fromCodePoint(0x0302) === String.fromCodePoint(770)

const sCap = String.fromCharCode(0x015d);

const wCap = String.fromCharCode(0x0175);

const zCap = String.fromCharCode(0x1e91);

describe(`ChilcotinTokenizer`, () => {
    describe(`tokenize`, () => {
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

            describe(`when some letters require multiple latin symbols`, () => {
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

                            assertTokenizationResult(result, [
                                ['d', 'a', 'r', 'l', 'ʔ', 'u', 'lh'],
                            ]);
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

            describe(`when there is a capped consonant`, () => {
                const assertFirstLetterIsInAlphabet = (tokens: Token[]) => {
                    const first = tokens[0].characters[0];

                    expect(first.isOutOfAlphabet).toBe(false);
                };

                describe(`when the consonant is lower-cased`, () => {
                    describe(`when the cap comes through as a separate character`, () => {
                        const inputForSCap = 's' + loneSurrogateCap + 'en';

                        const inputForWCap = 'w' + loneSurrogateCap + 'en';

                        const inputForZCap = 'z' + loneSurrogateCap + 'en';

                        describe(inputForSCap, () => {
                            it(`should return the expected result`, () => {
                                const result = tokenizer.tokenize(inputForSCap);

                                assertTokenizationResult(result, [[sCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });

                        describe(inputForWCap, () => {
                            it(`should return the expected result`, () => {
                                const result = tokenizer.tokenize(inputForWCap);

                                assertTokenizationResult(result, [[wCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });

                        describe(inputForZCap, () => {
                            it(`should return the expected result`, () => {
                                const result = tokenizer.tokenize(inputForZCap);

                                assertTokenizationResult(result, [[zCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });
                    });

                    describe(`when the capped consonant comes through as a single character`, () => {
                        describe('ŝen', () => {
                            it(`should return the expected result`, () => {
                                // TODO use unicode escape to be sure
                                const result = tokenizer.tokenize('\u015den');

                                // assertTokenizationResult(result, [['ŝ', 'e', 'n']]);

                                // const actualSCap = result[0].characters[0].text;

                                // const unicodeCharCodeForFirstLetter = actualSCap.codePointAt(0);

                                // expect(unicodeCharCodeForFirstLetter).toBe('u015d');

                                assertTokenizationResult(result, [[sCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });

                        describe('ŵen', () => {
                            it(`should return the expected result`, () => {
                                const unicodeChar = '\u0175';

                                // TODO use unicode escape to be sure
                                const result = tokenizer.tokenize(`${unicodeChar}en`);

                                assertTokenizationResult(result, [[wCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });

                        describe('ẑen', () => {
                            it(`should return the expected result`, () => {
                                const unicodeChar = '\u1e91';

                                const result = tokenizer.tokenize(`${unicodeChar}en`);

                                assertTokenizationResult(result, [[zCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });
                    });
                });

                describe(`when the consonant is upper-cased`, () => {
                    describe(`when the cap comes through as a separate character`, () => {
                        const inputForSCap = 'S' + loneSurrogateCap + 'en';

                        const inputForWCap = 'W' + loneSurrogateCap + 'en';

                        const inputForZCap = 'Z' + loneSurrogateCap + 'en';

                        describe(inputForSCap, () => {
                            it(`should return the expected result`, () => {
                                const result = tokenizer.tokenize(inputForSCap);

                                assertTokenizationResult(result, [[sCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);

                                const { isUpperCase } = result[0].characters[0];

                                expect(isUpperCase).toBe(true);
                            });
                        });

                        describe(inputForWCap, () => {
                            it(`should return the expected result`, () => {
                                const result = tokenizer.tokenize(inputForWCap);

                                assertTokenizationResult(result, [[wCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });

                        describe(inputForZCap, () => {
                            it(`should return the expected result`, () => {
                                const result = tokenizer.tokenize(inputForZCap);

                                assertTokenizationResult(result, [[zCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });
                    });

                    describe(`when the capped consonant comes through as a single character`, () => {
                        describe('ŝen', () => {
                            it(`should return the expected result`, () => {
                                // TODO use unicode escape to be sure
                                const result = tokenizer.tokenize('\u015cen');

                                assertTokenizationResult(result, [[sCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);

                                const { isUpperCase } = result[0].characters[0];

                                expect(isUpperCase).toBe(true);
                            });
                        });

                        describe('ŵen', () => {
                            it(`should return the expected result`, () => {
                                const unicodeChar = '\u0174';

                                // TODO use unicode escape to be sure
                                const result = tokenizer.tokenize(`${unicodeChar}en`);

                                assertTokenizationResult(result, [[wCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });

                        describe('ẑen', () => {
                            it(`should return the expected result`, () => {
                                const unicodeChar = '\u1e90';

                                const result = tokenizer.tokenize(`${unicodeChar}en`);

                                assertTokenizationResult(result, [[zCap, 'e', 'n']]);

                                assertFirstLetterIsInAlphabet(result);
                            });
                        });
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

    describe(`standardize`, () => {
        describe(`when an input contains lone surrogates`, () => {
            it(`should replace these with the character with the corresponding single unicode key point`, () => {
                const input = 'swzSWZ'
                    .split('')
                    .map((c) => `${c}${loneSurrogateCap}`)
                    .join('');

                const expectedOutput = `${sCap}${wCap}${zCap}${sCap.toUpperCase()}${wCap.toUpperCase()}${zCap.toUpperCase()}`;

                const result = tokenizer.standardize(input);

                // const _charCodeForSCap = result.codePointAt(0);

                // const charCodeForWCap = result.codePointAt(1);

                // expect(charCodeForSCap).toBe(0x015d);

                // expect(charCodeForWCap).toBe(0x0175);

                expect(result).toEqual(expectedOutput);
            });
        });
    });
});
