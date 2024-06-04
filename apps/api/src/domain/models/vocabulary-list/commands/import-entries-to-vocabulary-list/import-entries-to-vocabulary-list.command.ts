import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, RawDataObject, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { VocabularyListCompositeId } from '../create-vocabulary-list';

class VocabularyListEntryImportRecord {
    @ReferenceTo(AggregateType.term)
    @UUID({
        label: 'term id',
        description: 'the term id',
    })
    termId: AggregateId;

    @RawDataObject({
        label: 'property and value',
        description: 'property and value',
    })
    propertyValues: Record<string, boolean | string>;
}

@Command({
    type: 'IMPORT_ENTRIES_TO_VOCABULARY_LIST',
    label: 'import entries to a vocabulary list',
    description: 'bulk import entries to an empty vocabulary list',
})
export class ImportEntriesToVocabularyList implements ICommandBase {
    @NestedDataType(VocabularyListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: VocabularyListCompositeId;

    @NestedDataType(VocabularyListEntryImportRecord, {
        isOptional: false,
        isArray: true,
        label: 'entries for import',
        description: 'entries for import',
    })
    entries: VocabularyListEntryImportRecord[];
}
