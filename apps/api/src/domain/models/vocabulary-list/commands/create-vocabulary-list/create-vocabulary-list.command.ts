import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../../domain/types/AggregateCompositeIdentifier';
import { AggregateTypeProperty } from '../../../shared/common-commands';
import { CREATE_VOCABULARY_LIST } from './constants';

export class VocabularyListCompositeId {
    @AggregateTypeProperty([AggregateType.vocabularyList])
    type = AggregateType.vocabularyList;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: CREATE_VOCABULARY_LIST,
    label: 'Create Vocabulary List',
    description: 'creates a new vocabulary list',
})
export class CreateVocabularyList implements ICommandBase {
    @NestedDataType(VocabularyListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.vocabularyList
    >;

    @NonEmptyString({
        label: 'name',
        description: 'name of the vocabulary list',
    })
    name: string;

    @LanguageCodeEnum({
        label: 'language code for the name',
        description: 'the language in which you are naming the vocabulary list',
    })
    languageCodeForName: LanguageCode;

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description:
            'additional data from a legacy \\ third-party system that is the source of the data',
    })
    rawData?: Record<string, unknown>;
}
