import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { Aggregate } from '../domain/models/aggregate.entity';
import { Transcript } from '../domain/models/audio-item/entities/transcript.entity';
import { Video } from '../domain/models/audio-item/entities/video.entity';
import { DTO } from '../types/DTO';
import { buildSingleLanguageText } from './buildAudioItemTestData';
import buildMediaItemTestData from './buildMediaItemTestData';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const mediaItems = buildMediaItemTestData();

const partialDtos: DTO<Omit<Video, 'type'>>[] = [
    {
        id: '223',
        name: buildSingleLanguageText('The Demonstration', LanguageCode.English),
        mediaItemId: mediaItems[1].id,
        lengthMilliseconds: 20000,
        published: true,
        transcript: new Transcript({
            participants: [
                {
                    name: 'Dee Monstrator',
                    initials: 'DM',
                },
            ],
            items: [
                {
                    inPoint: 12000,
                    outPoint: 15550,
                    text: 'This is how.',
                    speakerInitials: 'DM',
                },
                {
                    inPoint: 18300,
                    outPoint: 19240,
                    text: 'It is done',
                    speakerInitials: 'DM',
                },
            ].map((item) => ({
                ...item,
                text: buildSingleLanguageText(item.text, LanguageCode.English),
            })),
        }),
    },
];

export default () =>
    partialDtos
        .map((partialDto) => new Video({ ...partialDto, type: ResourceType.audioItem }))
        .map((audioItemDto) =>
            convertAggregatesIdToUuid(audioItemDto as unknown as Aggregate)
        ) as Video[];
