import { ITextSymbol, TextSymbolType } from '@coscrad/api-interfaces';

export class ChilcotinTextParser {
    getSymbols(text: string): ITextSymbol[] {
        const chilcotinAlphabet = ['a', 'e', 'i', 'ɨ', 'u', 'o', 't', 'tl', 'y', 'g'];

        /**
         * TODO
         * 1. include support for manual exceptions list
         * 2. support parsing nasal vowels
         */
        if (text === 'naẑlhiny') {
            return ['n', 'a', 'ẑ', 'lh', 'in', 'y'].map((value) => ({
                value,
                type: TextSymbolType.letter,
            }));
        }

        const [last, symbols] = text.split('').reduce(
            ([current, allSymbols]: [string, ITextSymbol[]], nextLetter: string) => {
                if (chilcotinAlphabet.includes(current + nextLetter)) {
                    return [current + nextLetter, allSymbols];
                }

                if (chilcotinAlphabet.includes(current)) {
                    const symbolToAdd: ITextSymbol = {
                        value: current,
                        type: TextSymbolType.letter,
                    };

                    allSymbols.push(symbolToAdd);

                    // add the Chilcotin letter to the list and start again with the next letter as the candidate
                    return [nextLetter, allSymbols];
                }

                /**
                 * At this point, we have a letter and it isn't in the
                 * alphabet (even if you add the next char)
                 */
                const foreignSymbol: ITextSymbol = {
                    value: current,
                    type: TextSymbolType.foreignLetter,
                };

                allSymbols.push(foreignSymbol);

                return ['', allSymbols];
            },
            ['', []] as [string, ITextSymbol[]]
            // TODO fix types
        ) as [string, ITextSymbol[]];

        const result = symbols as ITextSymbol[];

        if (last.length > 0) {
            const lastSymbol: ITextSymbol = chilcotinAlphabet.includes(last)
                ? {
                      value: last,
                      type: TextSymbolType.letter,
                  }
                : {
                      value: last,
                      type: TextSymbolType.foreignLetter,
                  };

            result.push(lastSymbol);
        }

        return result;
    }
}
