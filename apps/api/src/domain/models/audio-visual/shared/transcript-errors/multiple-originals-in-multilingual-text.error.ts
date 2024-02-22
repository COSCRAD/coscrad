import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';

const getLabelFromLanguageCode = (languageCode: LanguageCode): string => {
    const labelAndValue = Object.entries(LanguageCode).find(
        ([_label, value]) => value === languageCode
    );

    if (isNullOrUndefined(labelAndValue))
        throw new InternalError(`Failed to find a label for language code: ${languageCode}`);

    const [label, _value] = labelAndValue;

    return label;
};

export class MultipleOriginalsInMultilingualTextError extends InternalError {
    constructor(languageCodes: LanguageCode[]) {
        super(
            `Encountered a multilingual text item with multiple original languages: ${languageCodes
                .map(getLabelFromLanguageCode)
                .join(',')}`
        );
    }
}
