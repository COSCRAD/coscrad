import { DropboxOrCheckbox } from './dropbox-or-checkbox.enum';
import { IValueAndDisplay } from './value-and-display.interface';

export interface IVocabularyListVariable<TVariableType> {
    name: string;

    type: DropboxOrCheckbox;

    validValues: IValueAndDisplay<TVariableType>[];
}
