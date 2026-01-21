import { IDynamicForm } from '../../../../form-data';
import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { DropboxOrCheckbox } from './dropbox-or-checkbox.enum';
import {
    ITermViewForVocabularyListEntry,
    IVocabularyListEntry,
} from './vocabulary-list-entry.interface';

type VariableValueType = string | boolean;

type ValueAndLabel<T = unknown> = {
    value: T;
    label: string;
};

type DynamicFilterPropertyName = `filterProperty${string}Value`;

interface DynamicFilterPropertyTableHeading {
    propertyKey: DynamicFilterPropertyName;
    headingLabel: string;
    type: DropboxOrCheckbox;
    allowedValuesAndLabels: ValueAndLabel<string | boolean>[];
}

type DynamicFilterPropertyValuesAndLabels = {
    [key: DynamicFilterPropertyName]: {
        label: string;
        value: string | boolean;
    };
};

export type IVocabularyListEntryTableRow = ITermViewForVocabularyListEntry &
    DynamicFilterPropertyName;

export interface IVocabularyListEntryTable {
    dynamicColumnHeadings: DynamicFilterPropertyTableHeading[];
    data: (ITermViewForVocabularyListEntry & DynamicFilterPropertyValuesAndLabels)[];
}

export interface IVocabularyListViewModel extends IBaseResourceViewModel {
    entries: IVocabularyListEntry<VariableValueType>[];

    form: IDynamicForm;

    table: IVocabularyListEntryTable;

    isPublished: boolean;

    // note that the accessControlList is private and needs to be removed before returning a query result to the user
}
