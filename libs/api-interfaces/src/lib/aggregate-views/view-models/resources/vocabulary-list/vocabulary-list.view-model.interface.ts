import { IDynamicForm } from '../../../../form-data';
import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IVocabularyListEntry } from './vocabulary-list-entry.interface';

type VariableValueType = string | boolean;

export interface IVocabularyListViewModel extends IBaseResourceViewModel {
    entries: IVocabularyListEntry<VariableValueType>[];

    form: IDynamicForm;

    isPublished: boolean;

    // note that the accessControlList is private and needs to be removed before returning a query result to the user
}
