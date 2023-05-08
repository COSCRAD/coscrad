import { Song } from '../domain/models/song/song.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const songDtos: DTO<Omit<Song, 'id'>>[] = [
    {
        type: ResourceType.song,
        // title: buildMultilingualTextWithSingleItem(
        //     'Song title in language',
        //     LanguageCode.Chilcotin
        // ).append(
        //     new MultilingualTextItem({
        //         text: 'Mary had a little lamb',
        //         languageCode: LanguageCode.English,
        //         role: MultilingualTextItemRole.freeTranslation,
        //     })
        // ),
        title: 'Song title in language',
        titleEnglish: 'Mary had a little lamb',
        lyrics: 'Mary had a little lamb, little lamb.',
        audioURL: 'https://www.myaudio.com/lamb.mp3',
        published: true,
        startMilliseconds: 0,
        lengthMilliseconds: 3500,
        contributions: [
            {
                contributorId: '1',
                role: 'performer',
            },
        ],
    },
    {
        type: ResourceType.song,
        // title: buildMultilingualTextWithSingleItem(
        //     'Unpublished Song Title (lang)',
        //     LanguageCode.Chilcotin
        // ).append(
        //     new MultilingualTextItem({
        //         text: 'Unpublished Song Title (Engl)',
        //         languageCode: LanguageCode.English,
        //         role: MultilingualTextItemRole.freeTranslation,
        //     })
        // ),
        title: `Unpublished Song Title (lang)`,
        titleEnglish: 'Unpublished Song Title (Engl)',
        lyrics: "Ain't gonna see the light of day, light of day, light of day",
        audioURL: 'https://www.myaudio.com/badsong.wav',
        published: false,
        startMilliseconds: 0,
        lengthMilliseconds: 33000,
        queryAccessControlList: {
            allowedUserIds: ['1'],
            allowedGroupIds: [],
        },
        contributions: [
            {
                contributorId: '33',
                role: 'author',
            },
        ],
    },
];

export default (): Song[] =>
    songDtos
        .map(
            (partialDTO, index) =>
                new Song({
                    ...partialDTO,
                    id: `${index + 1}`,
                    type: ResourceType.song,
                })
        )
        .map(convertAggregatesIdToUuid);
