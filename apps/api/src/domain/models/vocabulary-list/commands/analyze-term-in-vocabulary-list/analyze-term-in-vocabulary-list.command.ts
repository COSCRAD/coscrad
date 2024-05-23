import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, RawDataObject, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { VocabularyListCompositeId } from '../create-vocabulary-list';
@Command({
    type: 'ANALYZE_TERM_IN_VOCABULARY_LIST',
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

    @RawDataObject({
        label: 'property names and values',
        description: 'a record (dictionary) of filter property names and values',
    })
    readonly propertyValues: Record<string, boolean | string>;
}

/**
 * Design options
 * 1. The command takes strings and maps "false"-> false and "true" -> true
 *     - adds some complexity- need more test coverage
 *     - we should disallow "true" and "false" as values for a select in this case
 *     - this effectively pushes type validation to run time
 *     - but does give us a chance to explore a mapping layer from command to event
 * 2. Add a `OneOf[.,.,.]` to data-types, that is a different kind of union
 *      - adds complexity to this lib
 *      - possible confusion with @Union
 * 3. Add a `@NonEmptyStringOrBoolean` or `@VocabularyListProperty` **hard no**
 *      - leaks details about domain to data-types, not good
 * **Winner** 4. Have an object with
 * ```ts
 * {
 *    [propertyName]: propertyValue
 * }
 * ```
 *      - allows us to analyze several properties at once
 *      - consistent with `RegisterVocabularyListFilterProperty`
 *      - slightly more complicated setup and validation
 */
