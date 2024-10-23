import { MIMEType } from '@coscrad/data-types';
import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const dtos: DTO<MediaItem>[] = [
    {
        id: '1',
        title: 'episode (media item 1) title (in language)',
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
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '2',
        title: 'video (media item 2) title (in language)',
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
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '3',
        title: 'episode (media item 3) title (in language)',
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
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '4',
        title: 'snow mountain',
        contributorAndRoles: [],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/evergreen-2025158_1280.png',
        mimeType: MIMEType.png,
        published: true,
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '5',
        title: 'Adiitsii Running',
        contributorAndRoles: [],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/Adiitsii-Running.png',
        mimeType: MIMEType.png,
        published: true,
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '6',
        title: 'Nuu Story',
        contributorAndRoles: [],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/Nuu-Story.png',
        mimeType: MIMEType.png,
        published: true,
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '7',
        title: 'Two Brothers Pole',
        contributorAndRoles: [],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/TwoBrothersPole.png',
        mimeType: MIMEType.png,
        published: true,
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '8',
        title: 'Mary Had a Little Lamb',
        contributorAndRoles: [],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/mock-song-1_mary-had-a-little-lamb.wav',
        mimeType: MIMEType.wav,
        published: true,
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
    {
        id: '9',
        title: 'No Light',
        contributorAndRoles: [],
        url: 'https://coscrad.org/wp-content/uploads/2023/05/mock-song-2_UNPUBLISHED_aint-gonna-see-the-light-of-day.wav',
        mimeType: MIMEType.wav,
        published: true,
        hasBeenDeleted: false,
        type: ResourceType.mediaItem,
    },
];

export default () => dtos.map((dto) => new MediaItem(dto)).map(convertAggregatesIdToUuid);
