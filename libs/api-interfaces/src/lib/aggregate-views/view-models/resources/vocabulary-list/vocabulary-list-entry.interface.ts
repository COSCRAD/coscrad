import { IContributionSummary } from '../../base.view-model.interface';
import { IMultilingualTextRecord, ITermViewModel, IToken } from '../term.view-model.interface';

export interface ITermViewForVocabularyListEntry {
    id: string;

    audioURL?: string;

    mediaItemId?: string;

    name: IMultilingualTextRecord;

    // mimeType?: MIMEType; Do we want this?

    sourceProject?: string;

    tokens: IToken[];

    contributions: IContributionSummary[];
}

export interface IVocabularyListEntry<TAllowedValues> {
    // We don't need to see the actions in nested views right now
    term: Omit<ITermViewModel, 'actions' | 'vocabularyLists'>;
    // TODO change this to `propertyValues`
    variableValues: Record<string, TAllowedValues>;
}
