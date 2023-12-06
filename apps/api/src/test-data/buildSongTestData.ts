import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateSong } from '../domain/models/song/commands/create-song.command';
import { SongCreated } from '../domain/models/song/commands/song-created.event';
import { Song } from '../domain/models/song/song.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { clonePlainObjectWithOverrides } from '../lib/utilities/clonePlainObjectWithOverrides';
import { DTO } from '../types/DTO';
import {
    convertAggregatesIdToUuid,
    convertSequenceNumberToUuid,
} from './utilities/convertSequentialIdToUuid';

const dummyDateNow = 1664237194999;

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
        audioItemId: '9',
        published: true,
        contributions: [
            {
                contributorId: '1',
                role: 'performer',
            },
        ],
    },
    {
        type: ResourceType.song,
        title: buildMultilingualTextFromBilingualText(
            {
                text: `Unpublished Song Title (lang)`,
                languageCode: LanguageCode.Chilcotin,
            },
            // requires a `TranslateSongTitle` command
            {
                text: 'Unpublished Song Title (Engl)',
                languageCode: LanguageCode.English,
            }
        ),
        lyrics: buildMultilingualTextWithSingleItem(
            "Ain't gonna see the light of day, light of day, light of day",
            LanguageCode.English
        ),
        audioItemId: '115',
        // audioURL:
        //     'https://coscrad.org/wp-content/uploads/2023/05/mock-song-2_UNPUBLISHED_aint-gonna-see-the-light-of-day.wav',
        published: false,
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

/**
 * TODO We should build the test data from a command or
 * event stream. We are doing this in the opposite order
 * for historical reasons.
 */
const createSongCommands: CreateSong[] = songDtos.map(({ title, audioItemId }, index) => ({
    aggregateCompositeIdentifier: {
        type: AggregateType.song,
        id: (index + 1).toString(),
    },
    title: title.items.find(({ role }) => role === MultilingualTextItemRole.original).text,
    languageCodeForTitle: title.items.find(({ role }) => role === MultilingualTextItemRole.original)
        .languageCode,
    audioItemId,
}));

export default (): Song[] =>
    songDtos
        .map((partialDTO, index) => {
            const commandPayload = createSongCommands[index];

            const commandPayloadWithUuid = clonePlainObjectWithOverrides(commandPayload, {
                aggregateCompositeIdentifier: {
                    id: convertSequenceNumberToUuid(
                        parseInt(commandPayload.aggregateCompositeIdentifier.id)
                    ),
                },
            });

            const creationEvent = new SongCreated(
                commandPayloadWithUuid,
                buildDummyUuid(900 + index),
                buildDummyUuid(567),
                dummyDateNow
            );

            return new Song({
                ...partialDTO,
                id: `${index + 1}`,
                type: ResourceType.song,
                eventHistory: [creationEvent],
            });
        })
        .map(convertAggregatesIdToUuid);
