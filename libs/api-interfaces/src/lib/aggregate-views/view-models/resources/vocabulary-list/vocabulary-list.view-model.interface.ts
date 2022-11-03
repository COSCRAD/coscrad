import { IBaseViewModel } from '../../base.view-model.interface';
import { IVocabularyListEntry } from './vocabulary-list-entry.interface';
import { IVocabularyListVariable } from './vocabulary-list-variable.interface';

type VariableValueType = string | boolean;

export interface IVocabularyListViewModel extends IBaseViewModel {
    name?: string;

    nameEnglish?: string;

    entries: IVocabularyListEntry<VariableValueType>[];

    /**
     * Consider renaming this "form" also consider making it an `IFormData` by mapping
     * in the view model layer on the back-end. Note that the latter does not
     * require a migration.
     */
    variables: IVocabularyListVariable<VariableValueType>[];
}
