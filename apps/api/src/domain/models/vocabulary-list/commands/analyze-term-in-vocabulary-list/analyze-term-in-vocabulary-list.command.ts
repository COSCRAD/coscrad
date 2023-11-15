import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { VocabularyListCompositeId } from '../create-vocabulary-list';
import { ANALYZE_TERM_IN_VOCABULARY_LIST } from './constants';

@Command({
    type: ANALYZE_TERM_IN_VOCABULARY_LIST,
    label: 'analyze term in a vocabulary list',
    description: 'analyze a term in a vocabulary list',
})
export class AnalyzeTermInVocabularyList implements ICommandBase {
    @NestedDataType(VocabularyListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: VocabularyListCompositeId;

    @ReferenceTo(AggregateType.term)
    @UUID({
        label: 'term ID',
        description: 'the ID of the term you are analyzing in the vocabulary list',
    })
    readonly termId: AggregateId;
}
