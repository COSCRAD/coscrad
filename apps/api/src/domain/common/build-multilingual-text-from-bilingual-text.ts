import { InternalError } from '../../lib/errors/InternalError';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import { buildMultilingualTextWithSingleItem } from './build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from './entities/multilingual-text';

export class InvalidBilingualTextException extends InternalError {
    constructor() {
        super(
            `Bilingual text must have non-empty text for either the primary or secondary language`
        );
    }
}

export type TextAndLanguageCode = Pick<MultilingualTextItem, 'text' | 'languageCode'>;

export const buildMultilingualTextFromBilingualText = (
    primary: TextAndLanguageCode,
    secondary: TextAndLanguageCode
) => {
    if (isNullOrUndefined(primary) || isNullOrUndefined(secondary))
        throw new InvalidBilingualTextException();

    if (isNullOrUndefined(primary.text)) {
        if (isNullOrUndefined(secondary.text)) throw new InvalidBilingualTextException();

        return buildMultilingualTextWithSingleItem(secondary.text, secondary.languageCode);
    }

    const multilingualTextForPrimary = buildMultilingualTextWithSingleItem(
        primary.text,
        primary.languageCode
    );

    return isNullOrUndefined(secondary.text)
        ? multilingualTextForPrimary
        : (multilingualTextForPrimary.translate(
              new MultilingualTextItem({
                  ...secondary,
                  role: MultilingualTextItemRole.freeTranslation,
              })
          ) as MultilingualText);
};
