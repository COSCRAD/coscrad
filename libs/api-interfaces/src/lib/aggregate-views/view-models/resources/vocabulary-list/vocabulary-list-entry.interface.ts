import { ITermViewModel } from '../term.view-model.interface';

export interface IVocabularyListEntry<TAllowedValues> {
    term: ITermViewModel;
    variableValues: Record<string, TAllowedValues>;
}
