import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
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
        title: buildMultilingualTextFromBilingualText(
            {
                text: 'Song title in language',
                languageCode: LanguageCode.Chilcotin,
            },
            {
                text: `Mary had a little lamb (English)`,
                languageCode: LanguageCode.English,
            }
        ),
        lyrics: buildMultilingualTextWithSingleItem(
            'Mary had a little lamb, little lamb.',
            LanguageCode.English
        ),
        audioURL:
            'https://coscrad.org/wp-content/uploads/2023/05/mock-song-1_mary-had-a-little-lamb.wav',
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
        title: buildMultilingualTextFromBilingualText(
            {
                text: `Unpublished Song Title (lang)`,
                languageCode: LanguageCode.Chilcotin,
            },
            {
                text: 'Unpublished Song Title (Engl)',
                languageCode: LanguageCode.English,
            }
        ),
        lyrics: buildMultilingualTextWithSingleItem(
            "Ain't gonna see the light of day, light of day, light of day",
            LanguageCode.English
        ),
        audioURL:
            'https://coscrad.org/wp-content/uploads/2023/05/mock-song-2_UNPUBLISHED_aint-gonna-see-the-light-of-day.wav',
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
