import { IDynamicForm } from '../../../../form-data';
import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IVocabularyListEntry } from './vocabulary-list-entry.interface';

type VariableValueType = string | boolean;

export interface IVocabularyListViewModel extends IBaseResourceViewModel {
    entries: IVocabularyListEntry<VariableValueType>[];

    form: IDynamicForm;
}
