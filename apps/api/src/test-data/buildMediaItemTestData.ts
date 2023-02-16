import { MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

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
        type: ResourceType.mediaItem,
    },
    {
        id: '2',
        title: 'video title (in language)',
        titleEnglish: 'cool video',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        url: 'https://be.tsilhqotinlanguage.ca:3003/download?id=3028_6d3b2a922b.mp4',
        lengthMilliseconds: 910000,
        mimeType: MIMEType.mp4,
        published: true,
        type: ResourceType.mediaItem,
    },
];

export default () => dtos.map((dto) => new MediaItem(dto)).map(convertAggregatesIdToUuid);
