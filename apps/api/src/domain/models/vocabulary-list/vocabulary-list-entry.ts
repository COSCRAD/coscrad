import { AggregateId } from '../../types/AggregateId';
import { VocabularyListVariableValue } from './types/vocabulary-list-variable-value';

export class VocabularyListEntry {
    termId: AggregateId;

    variableValues: Record<string, VocabularyListVariableValue>;
}
