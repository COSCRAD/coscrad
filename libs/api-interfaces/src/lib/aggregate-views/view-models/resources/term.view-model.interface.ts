import { IBaseResourceViewModel } from '../base.view-model.interface';

export enum TextSymbolType {
    letter = 'letter',
    foreignLetter = 'foreignLetter', // escape hatch for "out of vocabulary" sequences
    punctuation = 'punctuation',
}

export interface ITextSymbol {
    value: string; // e.g. 'tl'
    type: TextSymbolType;
}

export interface ITermViewModel extends IBaseResourceViewModel {
    audioURL?: string;

    textBySymbols: ITextSymbol[];

    mediaItemId?: string;

    // mimeType?: MIMEType; Do we want this?

    sourceProject?: string;

    // TODO put this on the base interface
    isPublished: boolean;

    accessControlList: {
        allowedUserIds: string[];
        allowedGroupIds: string[];
    };
}
