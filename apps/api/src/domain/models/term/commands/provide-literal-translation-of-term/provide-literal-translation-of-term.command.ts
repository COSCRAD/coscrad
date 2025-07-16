import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCompositeIdentifier } from '../create-term';

@CoscradDataExample<ProvideLiteralTranslationOfTerm>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(1),
        },
        literalTranslation: 'me towards it (mushy) he throws',
        translationLanguageCode: LanguageCode.English,
    },
})
@Command({
    type: 'PROVIDE_LITERAL_TRANSLATION_OF_TERM',
    label: 'Provide Literal Translation',
    description:
        'provide a literal translation (as opposed to free) translation of a term into a second langauge',
})
export class ProvideLiteralTranslationOfTerm implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'composite ID (generated)',
        description: 'system-wide unique identifier for the new term',
    })
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NonEmptyString({
        label: 'literal translation',
        description: 'a literal translation of this term into the target language',
    })
    literalTranslation: string;

    @LanguageCodeEnum({
        label: 'translation language code',
        description:
            'the language in which you are providing a literal translation (typically English)',
    })
    translationLanguageCode: LanguageCode;
}
