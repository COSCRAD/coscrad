import { ITermViewModel } from '../term.view-model.interface';

export interface IVocabularyListEntry<TAllowedValues> {
    // We don't need to see the actions in nested views right now
    term: Omit<ITermViewModel, 'actions'>;
    // TODO change this to `propertyValues`
    variableValues: Record<string, TAllowedValues>;
}
