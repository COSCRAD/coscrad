import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseDocument } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { ICoscradMigration } from '../coscrad-migration.interface';
import { ICoscradQueryRunner } from '../coscrad-query-runner.interface';
import { Migration } from '../decorators/migration.decorator';

type TermDocument = ArangoDatabaseDocument<DTO<Term>>;

const defaultAudioExtension = 'mp3';

type PhotographDocument = ArangoDatabaseDocument<DTO<Photograph>>;

type OldPhotographDocument = Omit<PhotographDocument, 'imageUrl'> & { filename: string };

const defaultPhotographExtension = 'png';

/**
 * This is the name of the environment variable where the base digital asset url
 * (includes a trailing slash) should be stored.
 */
export const BASE_DIGITAL_ASSET_URL = 'BASE_DIGITAL_ASSET_URL';

@Migration({
    description: `convert legacy term and photograph media urls from relative to absolute paths and append extensions`,
    // TODO Should this be a date instead?
    dateAuthored: '20230513',
})
export class RemoveBaseDigitalAssetUrl implements ICoscradMigration {
    private readonly baseDigitalAssetUrl: string;

    readonly sequenceNumber = 1;

    readonly name = `RemoveBaseDigitalAssetUrl`;

    constructor() {
        this.baseDigitalAssetUrl = process.env[BASE_DIGITAL_ASSET_URL] || null;
    }

    async up(queryRunner: ICoscradQueryRunner): Promise<void> {
        /**
         * Note that we require this to be set as an environment variable so that
         * different instances can run the migration with different values for their
         * `baseDigitalAssetUrl`. We do not put this on the `.env` because we fail
         * fast at bootstrap if the .env is invalid and we do not want this to
         * interfere with the actual environment-variable based config. This is
         * also why we do not inject a config service here.
         */

        if (!isNonEmptyString(this.baseDigitalAssetUrl)) {
            // fail fast
            throw new InternalError(
                `Failed to parse ${BASE_DIGITAL_ASSET_URL} from the environment for migration`
            );
        }

        await queryRunner.update<TermDocument, TermDocument>(
            ArangoCollectionId.terms,
            ({ audioFilename }) => ({
                audioFilename: `${this.baseDigitalAssetUrl}${audioFilename}.${defaultAudioExtension}`,
            })
        );

        await queryRunner.update<OldPhotographDocument, PhotographDocument>(
            ArangoCollectionId.photographs,
            ({ filename }) => ({
                imageUrl: `${this.baseDigitalAssetUrl}${filename}.${defaultPhotographExtension}`,
                filename: null,
            })
        );
    }

    async down(queryRunner: ICoscradQueryRunner): Promise<void> {
        if (!isNonEmptyString(this.baseDigitalAssetUrl)) {
            // fail fast
            throw new InternalError(
                `Failed to parse ${BASE_DIGITAL_ASSET_URL} from the environment for migration`
            );
        }

        await queryRunner.update<TermDocument, TermDocument>(
            ArangoCollectionId.terms,
            ({ audioFilename }) => {
                if (audioFilename.includes(this.baseDigitalAssetUrl)) {
                    return {
                        audioFilename: audioFilename
                            .replace(this.baseDigitalAssetUrl, '')
                            .replace(`.${defaultAudioExtension}`, ''),
                    };
                }
            }
        );

        await queryRunner.update<PhotographDocument, OldPhotographDocument>(
            ArangoCollectionId.photographs,
            ({ imageUrl }) => {
                if (imageUrl.includes(this.baseDigitalAssetUrl)) {
                    return {
                        filename: imageUrl
                            .replace(this.baseDigitalAssetUrl, '')
                            .replace(`.${defaultPhotographExtension}`, ''),
                        imageUrl: null,
                    };
                }
            }
        );
    }
}
