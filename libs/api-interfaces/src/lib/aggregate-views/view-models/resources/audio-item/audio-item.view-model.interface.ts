import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common/multilingual-text/multilingual-text.interface';
import { MIMEType } from '../media-items';

export interface IAudioItemViewModel extends IBaseResourceViewModel {
    accessControlList: {
        allowedUserIds: string[];
        allowedGroupIds: string[];
    };

    isPublished: boolean;

    name: IMultilingualText;

    // aggregate ID
    mediaItemId: string;

    audioURL?: string;

    /**
     * TODO We should pull this info from the media service on the client, which
     * fetches the media by ID anyway. If we want to have this on the event-sourced
     * views, we should emit a second `MediaItemPropertiesProbed` from the prober
     * upon creation and **not** cache the state on the event. This should also
     * apply to properties like `lengthMilliseconds`. In fact, if we have
     * specific events for each media item type (e.g., `AudioItemPropertiesDiscovered`),
     * we will cut out the need for lots of optional properties on the media item creation event.
     */
    mimeType?: MIMEType;

    lengthMilliseconds: number;

    /**
     * TODO Make this an ITranscript
     */
    text: string;
}
