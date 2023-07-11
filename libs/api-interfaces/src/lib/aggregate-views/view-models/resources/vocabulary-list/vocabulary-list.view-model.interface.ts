import { IDynamicForm } from '../../../../form-data';
import { IBaseViewModel } from '../../base.view-model.interface';
import { IVocabularyListEntry } from './vocabulary-list-entry.interface';

type VariableValueType = string | boolean;

export interface IVocabularyListViewModel extends IBaseViewModel {
    entries: IVocabularyListEntry<VariableValueType>[];

    form: IDynamicForm;
}
