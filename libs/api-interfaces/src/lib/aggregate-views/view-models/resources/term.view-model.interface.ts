import { IBaseResourceViewModel } from '../base.view-model.interface';
import { IMultilingualText } from './common';

export interface IVocabularyListRecordForTerm {
    id: string;
    name: IMultilingualText;
    // TODO size
}

export interface ITermViewModel extends IBaseResourceViewModel {
    audioURL?: string;

    mediaItemId?: string;

    // mimeType?: MIMEType; Do we want this?

    sourceProject?: string;

    // TODO put this on the base interface
    isPublished: boolean;

    vocabularyLists: IVocabularyListRecordForTerm[];
}
