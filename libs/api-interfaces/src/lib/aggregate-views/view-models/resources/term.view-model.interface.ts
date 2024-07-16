import { IBaseResourceViewModel } from '../base.view-model.interface';

export interface ITermViewModel extends IBaseResourceViewModel {
    accessControlList: {
        allowedUserIds: string[];
        allowedGroupIds: string[];
    };

    audioURL?: string;

    mediaItemId?: string;

    // mimeType?: MIMEType; Do we want this?

    sourceProject?: string;
}
