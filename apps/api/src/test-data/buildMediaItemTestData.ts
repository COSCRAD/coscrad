import { MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { ResourceType } from '../domain/types/ResourceType';
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
        url: 'https://be.tsilhqotinlanguage.ca:3003/download?id=516_4d28711347.wav',
        lengthMilliseconds: 2500,
        mimeType: MIMEType.wav,
        published: true,
        type: ResourceType.mediaItem,
    },
];

export default () => dtos.map((dto) => new MediaItem(dto));
