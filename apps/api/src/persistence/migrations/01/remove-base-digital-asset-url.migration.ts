import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { DatabaseDocument } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';
import { Migration } from '../decorators/migration.decorator';

type TermDocument = DatabaseDocument<DTO<Term>>;

type PhotographDocument = DatabaseDocument<DTO<Photograph>>;

/**
 * This is the name of the environment variable where the base digital asset url
 * (includes a trailing slash) should be stored.
 */
export const BASE_DIGITAL_ASSET_URL = 'BASE_DIGITAL_ASSET_URL';

@Migration({
    description: `convert legacy media urls from relative to absolute paths`,
    // TODO Should this be a date instead?
    dateAuthored: '20230513',
})
export class RemoveBaseDigitalAssetUrl implements ICoscradMigration {
    private readonly baseDigitalAssetUrl: string;

    readonly sequenceNumber = 1;

    readonly name = `RemoveBaseDigitalAssetUrl`;

    constructor() {
        /**
         * Note that we require this to be set as an environment variable so that
         * different instances can run the migration with different values for their
         * `baseDigitalAssetUrl`. We do not put this on the `.env` because we fail
         * fast at bootstrap if the .env is invalid and we do not want this to
         * interfere with the actual environment-variable based config. This is
         * also why we do not inject a config service here.
         */
        this.baseDigitalAssetUrl = process.env[BASE_DIGITAL_ASSET_URL] || null;

        if (!isNonEmptyString(this.baseDigitalAssetUrl)) {
            // fail fast
            throw new InternalError(
                `Failed to parse ${BASE_DIGITAL_ASSET_URL} from the environment for migration`
            );
        }
    }

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        await queryRunner.update<TermDocument, TermDocument>(
            ArangoCollectionId.terms,
            ({ audioFilename }) => ({
                audioFilename: `${this.baseDigitalAssetUrl}${audioFilename}`,
            })
        );

        await queryRunner.update<PhotographDocument, PhotographDocument>(
            ArangoCollectionId.photographs,
            ({ imageUrl }) => ({
                imageUrl: `${this.baseDigitalAssetUrl}${imageUrl}`,
            })
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        await queryRunner.update<TermDocument, TermDocument>(
            ArangoCollectionId.terms,
            ({ audioFilename }) => {
                if (audioFilename.includes(this.baseDigitalAssetUrl)) {
                    return {
                        audioFilename: audioFilename.replace(this.baseDigitalAssetUrl, ''),
                    };
                }
            }
        );

        await queryRunner.update<PhotographDocument, PhotographDocument>(
            ArangoCollectionId.photographs,
            ({ imageUrl }) => {
                if (imageUrl.includes(this.baseDigitalAssetUrl)) {
                    return {
                        imageUrl: imageUrl.replace(this.baseDigitalAssetUrl, ''),
                    };
                }
            }
        );
    }
}
