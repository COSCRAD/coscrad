import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { MultilingualText, MultilingualTextItem } from './entities/multilingual-text';

/**
 * Sometimes there is a property that has a single piece of text. Typically,
 * this is in a context where only English text appears in the data (e.g., in
 * the research subdomain). This utility helps you convert such text to a proper
 * `MultilingualText` instance.
 *
 * @param text
 * @param languageCode
 * @returns a MultilingualText instance with a single item
 */
export const buildMultilingualTextWithSingleItem = (
    text: string,
    languageCode: LanguageCode = LanguageCode.English
) =>
    new MultilingualText({
        items: [
            new MultilingualTextItem({
                languageCode,
                // If there is only one text item, it must be the original
                role: MultilingualTextItemRole.original,
                text,
            }),
        ],
    });
