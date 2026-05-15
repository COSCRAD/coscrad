import { IMultilingualTextRecord } from '..';
import { MIMEType } from '../media-items';

export interface IPlaylistEpisode {
    name: IMultilingualTextRecord;

    mediaItemUrl: string;

    mimeType: MIMEType;

    // TODO Support 1 image for each item
    // imageUrl: string;
}
