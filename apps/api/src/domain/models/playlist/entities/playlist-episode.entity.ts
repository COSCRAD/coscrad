import { IMultilingualText, IPlaylistEpisode, MIMEType } from '@coscrad/api-interfaces';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';

export class PlaylistEpisode extends BaseDomainModel implements IPlaylistEpisode {
    readonly name: IMultilingualText;

    readonly mediaItemUrl: string;

    readonly mimeType: MIMEType;

    constructor(dto: DTO<PlaylistEpisode>) {
        super();

        if (!dto) return;

        const { name, mediaItemUrl, mimeType } = dto;

        this.name = name;

        this.mediaItemUrl = mediaItemUrl;

        this.mimeType = mimeType;
    }
}
