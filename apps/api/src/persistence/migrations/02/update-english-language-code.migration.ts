import { deepStringReplace, doesDeepAnyPropertyEqual } from '@coscrad/validation-constraints';
import clonePlainObjectWithoutProperty from '../../../lib/utilities/clonePlainObjectWithoutProperty';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';

const OLD_ENGLISH_LANGUAGE_CODE = 'eng';

const NEW_ENGLISH_LANGUAGE_CODE = 'en';

const collectionsToUpdate: ArangoCollectionId[] = [
    ArangoCollectionId.audio_items,
    ArangoCollectionId.songs,
    ArangoCollectionId.media_items,
    ArangoCollectionId.vocabulary_lists,
    ArangoCollectionId.terms,
];

export class UpdateEnglishLanguageCode implements ICoscradMigration {
    readonly sequenceNumber = 2;

    readonly name = `UpdateEnglishLanguageCode`;

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        await Promise.all(
            collectionsToUpdate.map((collectionName) =>
                this.upForCollection(queryRunner, collectionName)
            )
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        await Promise.all(
            collectionsToUpdate.map((collectionName) =>
                this.downForCollection(queryRunner, collectionName)
            )
        );
    }

    private async upForCollection(
        queryRunner: ICoscradQueryRunner,
        collectionName: ArangoCollectionId
    ): Promise<void> {
        await queryRunner.update(collectionName, (doc) => {
            if (!doesDeepAnyPropertyEqual(OLD_ENGLISH_LANGUAGE_CODE)(doc)) return {};

            const updatedDocument = clonePlainObjectWithoutProperty(
                deepStringReplace(OLD_ENGLISH_LANGUAGE_CODE, NEW_ENGLISH_LANGUAGE_CODE, doc),
                '_rev'
            );

            return updatedDocument;
        });
    }

    private async downForCollection(
        queryRunner: ICoscradQueryRunner,
        collectionName: ArangoCollectionId
    ): Promise<void> {
        await queryRunner.update(collectionName, (doc) => {
            if (!doesDeepAnyPropertyEqual(NEW_ENGLISH_LANGUAGE_CODE)(doc)) return {};

            return deepStringReplace(NEW_ENGLISH_LANGUAGE_CODE, OLD_ENGLISH_LANGUAGE_CODE, doc);
        });
    }
}
