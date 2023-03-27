import { MIMEType } from '../media-items';

export interface IPlaylistEpisode {
    // TODO make this multi-lingual text
    name: string;

    mediaItemUrl: string;

    mimeType: MIMEType;

    // TODO Support 1 image for each item
    // imageUrl: string;
}
