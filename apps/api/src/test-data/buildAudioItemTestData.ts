import { LanguageCode } from '@coscrad/api-interfaces';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../domain/common/entities/multilingual-text';
import { AudioItem } from '../domain/models/audio-item/entities/audio-item.entity';
import { Transcript } from '../domain/models/audio-item/entities/transcript.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import buildMediaItemTestData from './buildMediaItemTestData';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const mediaItems = buildMediaItemTestData();

const buildSingleLanguageText = (text: string, languageCode: LanguageCode) =>
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
        transcript: new Transcript({
            participants: [
                {
                    name: 'Jimmy H. Cricket',
                    initials: 'JHC',
                },
            ],
            items: [
                {
                    inPoint: 12000,
                    outPoint: 15550,
                    text: 'There once was a little wooden boy.',
                    speakerInitials: 'JHC',
                },
                {
                    inPoint: 18300,
                    outPoint: 19240,
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
                    inPoint: 3400,
                    outPoint: 3670,
                    text: 'While she went down to the river',
                    speakerInitials: 'BL',
                },
                {
                    inPoint: 3700,
                    outPoint: 3980,
                    text: 'someone had already filled the water tank.',
                    speakerInitials: 'SD',
                },
                {
                    inPoint: 4010,
                    outPoint: 4290,
                    text: 'These were the types of problems we had.',
                    speakerInitials: 'BL',
                },
            ].map((item) => ({
                ...item,
                text: buildSingleLanguageText(item.text, LanguageCode.English),
            })),
        },
        mediaItemId: mediaItems[0].id,
        lengthMilliseconds: 23409,
        published: true,
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
                    inPoint: 120,
                    outPoint: 848,
                    text: 'this type of spoon is used in ceremonies',
                    speakerInitials: 'E1',
                },
                {
                    inPoint: 930,
                    outPoint: 1080,
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
    },
];

export default () =>
    partialDtos
        .map((partialDto) => new AudioItem({ ...partialDto, type: ResourceType.audioItem }))
        .map(convertAggregatesIdToUuid);
