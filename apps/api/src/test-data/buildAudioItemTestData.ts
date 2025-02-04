import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../domain/common/entities/multilingual-text';
import { Aggregate } from '../domain/models/aggregate.entity';
import { AudioItem } from '../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { Transcript } from '../domain/models/audio-visual/shared/entities/transcript.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import buildMediaItemTestData from './buildMediaItemTestData';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const mediaItems = buildMediaItemTestData();

export const buildSingleLanguageText = (text: string, languageCode: LanguageCode) =>
    new MultilingualText({
        items: [
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.original,
            }),
        ],
    });

const partialDtos: DTO<Omit<AudioItem, 'type'>>[] = [
    {
        id: '110',
        name: buildSingleLanguageText('The Wooden Boy', LanguageCode.English),
        mediaItemId: mediaItems[0].id,
        lengthMilliseconds: 20000,
        published: true,
        hasBeenDeleted: false,
        transcript: new Transcript({
            participants: [
                {
                    name: 'Jimmy H. Cricket',
                    initials: 'JHC',
                },
            ],
            items: [
                {
                    inPointMilliseconds: 12000,
                    outPointMilliseconds: 15550,
                    text: 'There once was a little wooden boy.',
                    speakerInitials: 'JHC',
                },
                {
                    inPointMilliseconds: 18300,
                    outPointMilliseconds: 19240,
                    text: 'His name was Pinocchio',
                    speakerInitials: 'JHC',
                },
            ].map((item) => ({
                ...item,
                text: buildSingleLanguageText(item.text, LanguageCode.English),
            })),
        }),
    },
    {
        id: '111',
        name: buildSingleLanguageText('Down at the River', LanguageCode.Chilcotin),
        transcript: {
            participants: [
                {
                    name: 'Bob LeRob',
                    initials: 'BL',
                },
                {
                    name: 'Sue DeDue',
                    initials: 'SD',
                },
            ],
            items: [
                {
                    inPointMilliseconds: 3400,
                    outPointMilliseconds: 3670,
                    text: 'While she went down to the river',
                    speakerInitials: 'BL',
                },
                {
                    inPointMilliseconds: 3700,
                    outPointMilliseconds: 3980,
                    text: 'someone had already filled the water tank.',
                    speakerInitials: 'SD',
                },
                {
                    inPointMilliseconds: 4010,
                    outPointMilliseconds: 4290,
                    text: 'These were the types of problems we had.',
                    speakerInitials: 'BL',
                },
            ].map((item) => ({
                ...item,
                text: buildSingleLanguageText(item.text, LanguageCode.English),
            })),
        },
        mediaItemId: mediaItems[2].id,
        lengthMilliseconds: 23409,
        published: true,
        hasBeenDeleted: false,
    },
    {
        id: '113',
        name: buildSingleLanguageText('Learning about Protocols', LanguageCode.Haida),
        transcript: {
            participants: [
                {
                    name: 'Elder 1',
                    initials: 'E1',
                },
                {
                    name: 'Elder 2',
                    initials: 'E2',
                },
            ],
            items: [
                {
                    inPointMilliseconds: 120,
                    outPointMilliseconds: 848,
                    text: 'this type of spoon is used in ceremonies',
                    speakerInitials: 'E1',
                },
                {
                    inPointMilliseconds: 930,
                    outPointMilliseconds: 1080,
                    text: 'by members of the opposite clan of the house chief',
                    speakerInitials: 'E2',
                },
            ].map((item) => ({
                ...item,
                text: buildSingleLanguageText(item.text, LanguageCode.English),
            })),
        },
        mediaItemId: mediaItems[0].id,
        lengthMilliseconds: 32989,
        published: true,
        hasBeenDeleted: false,
    },
    {
        id: '114',
        name: buildMultilingualTextWithSingleItem(`Mary had a Little Lamb`),
        mediaItemId: mediaItems[7].id,
        // TODO use real value here
        lengthMilliseconds: 1000,
        published: true,
        hasBeenDeleted: false,
    },
    {
        id: '115',
        name: buildMultilingualTextWithSingleItem('No Light'),
        mediaItemId: mediaItems[8].id,
        lengthMilliseconds: 10,
        published: true,
        hasBeenDeleted: false,
    },
];

export default () =>
    partialDtos
        .map((partialDto) => new AudioItem({ ...partialDto, type: ResourceType.audioItem }))
        .map((audioItemDto) => convertAggregatesIdToUuid(audioItemDto as unknown as Aggregate));
