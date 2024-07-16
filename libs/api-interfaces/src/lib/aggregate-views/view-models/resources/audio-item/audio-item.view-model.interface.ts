import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common/multilingual-text/multilingual-text.interface';
import { MIMEType } from '../media-items';

export interface IAudioItemViewModel extends IBaseResourceViewModel {
    accessControlList: {
        allowedUserIds: string[];
        allowedGroupIds: string[];
    };

    name: IMultilingualText;

    // aggregate ID
    mediaItemId: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    /**
     * TODO Make this an ITranscript
     */
    text: string;
}
