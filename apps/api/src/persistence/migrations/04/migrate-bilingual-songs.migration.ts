import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../../../domain/common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Song } from '../../../domain/models/song/song.entity';
import { DTO } from '../../../types/DTO';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseDocument } from '../../database/utilities/mapEntityDTOToDatabaseDocument';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';
import { Migration } from '../decorators';

type SongDocument = ArangoDatabaseDocument<DTO<Song>>;

type OldSongDocument = Omit<SongDocument, 'title'> & {
    title: string;
    titleEnglish: string;
};

const buildMultilingualText = (title: string, titleEnglish: string): DTO<MultilingualText> => {
    return buildMultilingualTextFromBilingualText(
        { text: title, languageCode: LanguageCode.Chilcotin },
        {
            text: titleEnglish,
            languageCode: LanguageCode.English,
        }
    ).toDTO();
};

const extract = (
    languageCodeToExtract: LanguageCode,
    multilingualTextDto: DTO<MultilingualText>
): string | null =>
    multilingualTextDto.items.find(({ languageCode }) => languageCode === languageCodeToExtract)
        ?.text || null;

@Migration({
    description: `convert song titles from bilingual to multilingual`,
    dateAuthored: `20230728`,
})
export class MigrateBilingualSongs implements ICoscradMigration {
    sequenceNumber = 4;

    name = `MigrateBilingualSongs`;

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        // migrate songs
        await queryRunner.update<OldSongDocument, SongDocument>(
            ArangoCollectionId.songs,
            ({ title, titleEnglish }: OldSongDocument) => {
                if (!title && !titleEnglish) return {};

                return {
                    titleEnglish: null,
                    title: buildMultilingualText(title, titleEnglish),
                };
            }
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        // revert songs
        await queryRunner.update<SongDocument, OldSongDocument>(
            ArangoCollectionId.songs,
            (songDoc: SongDocument) => {
                const { title } = songDoc;

                return {
                    title: extract(LanguageCode.Chilcotin, title),
                    titleEnglish: extract(LanguageCode.English, title),
                };
            }
        );
    }
}
