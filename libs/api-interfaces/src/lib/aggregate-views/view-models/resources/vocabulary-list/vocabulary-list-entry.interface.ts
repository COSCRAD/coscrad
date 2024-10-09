import { ITermViewModel } from '../term.view-model.interface';

export interface IVocabularyListEntry<TAllowedValues> {
    term: ITermViewModel;
    // TODO change this to `propertyValues`
    variableValues: Record<string, TAllowedValues>;
}
