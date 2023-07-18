import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { TermCompositeIdentifier } from '../create-term';
import { TRANSLATE_TERM } from './constants';

@Command({
    type: TRANSLATE_TERM,
    label: 'Translate Term',
    description: `Translate an existing term (typically from the language to English)`,
})
export class TranslateTerm implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'term composite identifier (generated)',
        description: 'system wide unique identifier',
    })
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the given term',
    })
    translation: string;

    @LanguageCodeEnum({
        label: `language`,
        description: `language in which you are translating the term (typically English)`,
    })
    languageCode: LanguageCode;
}
