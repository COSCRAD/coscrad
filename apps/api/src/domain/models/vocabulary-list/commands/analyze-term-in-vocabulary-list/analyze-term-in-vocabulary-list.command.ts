import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, ReferenceTo, UUID } from '@coscrad/data-types';
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

    @NonEmptyString({
        label: `filter property name`,
        description: `the name of the filter property for which you are providing a value`,
    })
    readonly propertyName: string;

    @NonEmptyString({
        label: `filter property value`,
        description: `the value of the filter property that matches this entry`,
    })
    // TODO support boolean
    readonly propertyValue: boolean | string;
}
