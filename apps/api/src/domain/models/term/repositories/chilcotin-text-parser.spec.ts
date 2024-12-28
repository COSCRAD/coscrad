import { ITextSymbol, TextSymbolType } from '@coscrad/api-interfaces';
import { ChilcotinTextParser } from './chilcotin-text-parser';

describe(`ChilcotinTextParser`, () => {
    describe(`getSymbols`, () => {
        describe(`when there is a single Chilcotin word: "teyatlɨg"`, () => {
            it(`should return the expected result`, () => {
                const input = 'teyatlɨg';

                const expectedResult: ITextSymbol[] = ['t', 'e', 'y', 'a', 'tl', 'ɨ', 'g'].map(
                    (l) => ({
                        value: l,
                        type: TextSymbolType.letter,
                    })
                );

                const result = new ChilcotinTextParser().getSymbols(input);

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
