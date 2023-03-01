import { DTO } from '../../../..//types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { PlaylistItem } from './playlist-item.entity';

export class Playlist extends Resource {
    readonly type = ResourceType.playlist;

    readonly name: MultilingualText;

    // TODO add refrence to photograph

    readonly items: PlaylistItem[];

    constructor(dto: DTO<Playlist>) {
        super(dto);

        if (!dto) return;

        const { name, items } = dto;

        this.name = new MultilingualText(name);

        if (Array.isArray(items)) this.items = items.map((item) => new PlaylistItem(item));
    }
}
