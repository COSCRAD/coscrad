import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../domain/common/entities/multilingual-text';
import { Song } from '../domain/models/song/song.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

export default (): Song[] =>
    [
        {
            type: ResourceType.song,
            title: buildMultilingualTextWithSingleItem(
                'Song title in language',
                LanguageCode.Chilcotin
            ).append(
                new MultilingualTextItem({
                    text: 'Mary had a little lamb',
                    languageCode: LanguageCode.English,
                    role: MultilingualTextItemRole.freeTranslation,
                })
            ),
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
            title: buildMultilingualTextWithSingleItem(
                'Unpublished Song Title (lang)',
                LanguageCode.Chilcotin
            ).append(
                new MultilingualTextItem({
                    text: 'Unpublished Song Title (Engl)',
                    languageCode: LanguageCode.English,
                    role: MultilingualTextItemRole.freeTranslation,
                })
            ),
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
    ]
        .map(
            (partialDTO, index) =>
                new Song({
                    ...partialDTO,
                    id: `${index + 1}`,
                    type: ResourceType.song,
                })
        )
        .map(convertAggregatesIdToUuid);
