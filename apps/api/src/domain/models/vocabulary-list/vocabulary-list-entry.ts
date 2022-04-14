import { EntityId } from '../../types/ResourceId';
import { VocabularyListVariableValue } from './types/vocabulary-list-variable-value';

export class VocabularyListEntry {
    termId: EntityId;

    variableValues: Record<string, VocabularyListVariableValue>;
}
