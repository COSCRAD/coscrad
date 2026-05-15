import { IMultilingualTextRecord } from '..';
import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { MIMEType } from '../media-items';

export interface IAudioItemViewModel extends IBaseResourceViewModel {
    accessControlList: {
        allowedUserIds: string[];
        allowedGroupIds: string[];
    };

    isPublished: boolean;

    name: IMultilingualTextRecord;

    // aggregate ID
    mediaItemId: string;

    audioURL?: string;

    mimeType?: MIMEType;

    lengthMilliseconds: number;

    /**
     * TODO Make this an ITranscript
     */
    text: string;
}
