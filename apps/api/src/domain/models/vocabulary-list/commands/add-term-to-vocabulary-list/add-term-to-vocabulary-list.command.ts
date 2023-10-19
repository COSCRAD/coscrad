import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { VocabularyListCompositeId } from '../create-vocabulary-list';
import { ADD_TERM_TO_VOCABULARY_LIST } from './constants';

@Command({
    type: ADD_TERM_TO_VOCABULARY_LIST,
    label: 'add term to vocabulary list',
    description: 'add a term to the vocabulary list',
})
export class AddTermToVocabularyList implements ICommandBase {
    @NestedDataType(VocabularyListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: VocabularyListCompositeId;

    @ReferenceTo(AggregateType.term)
    @UUID({
        label: 'term ID',
        description: 'the ID of the term you are adding to this vocabulary list',
    })
    readonly termId: AggregateId;
}
