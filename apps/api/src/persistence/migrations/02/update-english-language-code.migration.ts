import { LanguageCode } from '@coscrad/api-interfaces';
import { deepStringReplace, doesDeepAnyPropertyEqual } from '@coscrad/validation-constraints';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../domain/common/entities/multilingual-text';
import { AudioItem } from '../../../domain/models/audio-item/entities/audio-item.entity';
import { DTO } from '../../../types/DTO';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { DatabaseDTO } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';

const OLD_ENGLISH_LANGUAGE_CODE = 'eng';

const NEW_ENGLISH_LANGUAGE_CODE = 'en';

type AudioDocument = DatabaseDTO<DTO<AudioItem>>;

type OldAudioDocument = Omit<AudioDocument, 'name'> & {
    name: Omit<MultilingualText, 'items'> & {
        items: (Omit<MultilingualTextItem, 'languageCode'> & {
            languageCode: LanguageCode | typeof OLD_ENGLISH_LANGUAGE_CODE;
        })[];
    };
};

export class UpdateEnglishLanguageCode implements ICoscradMigration {
    readonly sequenceNumber = 2;

    readonly name = `UpdateEnglishLanguageCode`;

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        const collectionsToUpdate: ArangoCollectionId[] = [
            ArangoCollectionId.audio_items,
            ArangoCollectionId.songs,
            ArangoCollectionId.media_items,
            ArangoCollectionId.vocabulary_lists,
            ArangoCollectionId.terms,
        ];

        collectionsToUpdate.forEach(async (collectionName) => {
            await queryRunner.update(collectionName, (doc) => {
                if (!doesDeepAnyPropertyEqual(OLD_ENGLISH_LANGUAGE_CODE)(doc)) return {};
            });
        });

        await queryRunner.update<OldAudioDocument, AudioDocument>(
            ArangoCollectionId.audio_items,
            (doc) => {
                if (!doesDeepAnyPropertyEqual(OLD_ENGLISH_LANGUAGE_CODE)(doc)) return {};

                return deepStringReplace(OLD_ENGLISH_LANGUAGE_CODE, NEW_ENGLISH_LANGUAGE_CODE, doc);
            }
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        await queryRunner.update<AudioDocument, AudioDocument>(
            ArangoCollectionId.audio_items,
            (doc) => {
                if (!doesDeepAnyPropertyEqual(NEW_ENGLISH_LANGUAGE_CODE)(doc)) return {};

                return deepStringReplace(NEW_ENGLISH_LANGUAGE_CODE, OLD_ENGLISH_LANGUAGE_CODE, doc);
            }
        );
    }
}
