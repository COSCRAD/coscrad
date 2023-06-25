import { MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const dtos: DTO<MediaItem>[] = [
    {
        id: '1',
        title: 'episode (media item 1) title (in language)',
        titleEnglish: 'Metal Mondays episode 1',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock1_533847__tosha73__distortion-guitar-power-chord-e.wav',
        lengthMilliseconds: 2500,
        mimeType: MIMEType.wav,
        published: true,
        type: ResourceType.mediaItem,
    },
    {
        id: '2',
        title: 'video (media item 2) title (in language)',
        titleEnglish: 'cool video',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4',
        lengthMilliseconds: 910000,
        mimeType: MIMEType.mp4,
        published: true,
        type: ResourceType.mediaItem,
    },
    {
        id: '3',
        title: 'episode (media item 3) title (in language)',
        titleEnglish: 'Metal Mondays episode 2',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock2_370934__karolist__guitar-solo.mp3',
        lengthMilliseconds: 2500,
        mimeType: MIMEType.mp3,
        published: true,
        type: ResourceType.mediaItem,
    },
];

export default () => dtos.map((dto) => new MediaItem(dto)).map(convertAggregatesIdToUuid);
