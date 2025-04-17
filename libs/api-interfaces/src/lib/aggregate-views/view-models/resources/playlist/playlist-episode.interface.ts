import { IMultilingualText } from '../common';
import { MIMEType } from '../media-items';

export interface IPlaylistEpisode {
    name: IMultilingualText;

    mediaItemUrl: string;

    mimeType: MIMEType;

    // TODO Support 1 image for each item
    // imageUrl: string;
}
