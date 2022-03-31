import { EntityId } from '../../types/EntityId';
import { VocabularyListVariableValue } from './types/vocabulary-list-variable-value';

export class VocabularyListEntry {
    termId: EntityId;

    variableValues: Record<string, VocabularyListVariableValue>;
}
