import { ResourceId } from '../../types/ResourceId';
import { VocabularyListVariableValue } from './types/vocabulary-list-variable-value';

export class VocabularyListEntry {
    termId: ResourceId;

    variableValues: Record<string, VocabularyListVariableValue>;
}
