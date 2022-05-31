import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { MIMEType } from '../domain/models/media-item/types/MIMEType';
import { resourceTypes } from '../domain/types/resourceTypes';
import { DTO } from '../types/DTO';

const dtos: DTO<MediaItem>[] = [
    {
        id: '1',
        title: 'episode title (in language)',
        titleEnglish: 'Metal Mondays episode 1',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        url: 'https://www.metalmondays.com/1.mp3',
        lengthMilliseconds: 2500,
        mimeType: MIMEType.mp3,
        published: true,
        type: resourceTypes.mediaItem,
    },
];

export default () => dtos.map((dto) => new MediaItem(dto));
