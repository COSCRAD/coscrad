import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { Aggregate } from '../domain/models/aggregate.entity';
import { Transcript } from '../domain/models/audio-visual/shared/entities/transcript.entity';
import { Video } from '../domain/models/audio-visual/video/entities/video.entity';
import { DTO } from '../types/DTO';
import { buildSingleLanguageText } from './buildAudioItemTestData';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const partialDtos: DTO<Omit<Video, 'type'>>[] = [
    {
        id: '223',
        name: buildSingleLanguageText('The Demonstration', LanguageCode.English),
        mediaItemId: buildDummyUuid(10002),
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
                    inPointMilliseconds: 12000,
                    outPointMilliseconds: 15550,
                    text: 'This is how.',
                    speakerInitials: 'DM',
                },
                {
                    inPointMilliseconds: 18300,
                    outPointMilliseconds: 19240,
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
        .map((partialDto) => new Video({ ...partialDto, type: ResourceType.video }))
        .map((audioItemDto) => convertAggregatesIdToUuid(audioItemDto as unknown as Aggregate));
