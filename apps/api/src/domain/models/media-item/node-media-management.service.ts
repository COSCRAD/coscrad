import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import {
    isNonEmptyObject,
    isNonEmptyString,
    isNonNegativeFiniteNumber,
} from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { copyFileSync } from 'fs';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { ResultOrError } from '../../../types/ResultOrError';
import { ID_MANAGER_TOKEN, IIdManager } from '../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { CreateMediaItem } from './commands';
import { getExpectedMimeTypeFromExtension } from './entities/get-extension-for-mime-type';
import { MediaItem } from './entities/media-item.entity';
import { IMediaManager } from './media-manager.interface';
import { IMediaProber, MEDIA_PROBER_TOKEN } from './media-prober';
import path = require('path');

// TODO  move this
const MS_PER_S = 1000;

const staticAssetsDir = '__static__';

interface MediaCreationAcknowledgement {
    id: AggregateId;
}

/**
 * Note that in the future we would like to
 * 1. move the media manager out of process (separate deployment)
 *
 * 2. write the media manager in a different language \ runtime to improve
 * performance and make future-scoped features easier to implement
 */
export class NodeMediaManagementService implements IMediaManager {
    constructor(
        @Inject('MEDIA_ITEM_COMMAND_REPOSITORY_INJECTION_TOKEN')
        private readonly commandRepository: IRepositoryForAggregate<MediaItem>,
        @Inject(MEDIA_PROBER_TOKEN) private readonly mediaProber: IMediaProber,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        private readonly commandHandlerService: CommandHandlerService
    ) {}

    create(_binary: ReadableStream): Promise<ResultOrError<MediaCreationAcknowledgement>> {
        throw new Error('Creating a media item from binary is not yet supported.');
    }

    /**
     * Note that this requires an admin to first transfer the files to an ingestion
     * directory.
     *
     * @param filepath path to the file within an ingestion directory accessible to the node process
     */
    async discover(filepath: string): Promise<ResultOrError<MediaCreationAcknowledgement>> {
        // TODO check if file exists
        const extension = path.extname(filepath);

        if (!isNonEmptyString(extension)) {
            throw new InternalError(
                `encountered an invalid filepath: ${filepath}. must include an extension`
            );
        }

        const dirname = path.dirname(filepath);

        const filename = path.basename(filepath);

        if (!isNonEmptyString(extension)) {
            throw new InternalError(
                `failed to parse extension for file: ${filepath}. Invalid result: ${extension}`
            );
        }

        // does this throw if it doesn't recognize the extension?
        const expectedMimetypeFromExtension = getExpectedMimeTypeFromExtension(extension);

        const probeResult = await this.mediaProber.probe(filepath);

        if (isNotFound(probeResult)) {
            throw new Error('todo- return this error');
        }

        /**
         * TODO it is critical that we validate the mime type against the extension
         * before opening up an endpoint to upload binary files
         */
        // if (expectedMimetypeFromExtension !== probeResult.mimeType) {
        //     throw new Error(`todo = return this error?`);
        // }

        // TODO Execute a command instead
        const newMediaItem: MediaItem = new MediaItem({
            // TODO shouldn't this be passed in?
            title: dirname,
            // TODO remove this
            type: ResourceType.mediaItem,
            mimeType: expectedMimetypeFromExtension,
            // this is totally wrong!
            published: true,
            // TODO we need the ID generator- better to just execute the command
            id: buildDummyUuid(1),
            // todo remove this!
        });

        /**
         * TODO We may want to pass this state in from above.
         * Consider generating many for discoverAll
         */
        const generatedId = await this.idManager.generate();

        /**
         * There's a bit of a chicken-and-egg problem here. The command handler
         * uses the prober and determines the duration \ dimensions.
         */
        const creationCommand: {
            -readonly [K in keyof CreateMediaItem]: CreateMediaItem[K];
        } = {
            title: dirname,
            mimeType: expectedMimetypeFromExtension,
            aggregateCompositeIdentifier: {
                id: generatedId,
                type: AggregateType.mediaItem,
            },
        };

        if (isNonNegativeFiniteNumber(probeResult.durationSeconds)) {
            creationCommand.lengthMilliseconds = probeResult.durationSeconds * MS_PER_S;
        }

        if (
            isNonNegativeFiniteNumber(probeResult.heightPx) &&
            isNonNegativeFiniteNumber(probeResult.widthPx)
        ) {
            creationCommand.heightPx = probeResult.heightPx;

            creationCommand.widthPx = probeResult.widthPx;
        }

        // TODO handle file copy failure
        // TODO We may want to abstract over file reads and writes with a binary file repository
        /**
         * Note that we write the file before persisting to the database because
         * it is better to have an orphaned file than a database record that
         * is missing media in case of failure.
         */

        // Note that filename includes the extension
        copyFileSync(filepath, `${staticAssetsDir}/${filename}`);

        /**
         * Note that at this point, the command execution is an encapsulated
         * implementation detail of the media-service. We don't have to follow any
         * CQRS-ES patterns here. We simply stick to this because it was built
         * this way to start with.
         */
        const result = await this.commandHandlerService.execute(
            {
                type: 'CREATE_MEDIA_ITEM',
                payload: creationCommand,
            },
            {
                userId: 'COSCRAD_ADMIN',
                // TODO We may want to handle metadata differently on media items
                contributorIds: [],
            }
        );

        if (isInternalError(result)) {
            return result;
        }

        return {
            id: newMediaItem.id,
        };
    }

    async exists(id: AggregateId): Promise<boolean> {
        const targetMediaItem = await this.commandRepository.fetchById(id);

        return !isNotFound(targetMediaItem);
    }

    /**
     * We might not want this method. To validate commands, we only need `exists`.
     *
     * To build views (event consumers), we only need `buildUrlFor(id)`. In fact,
     * this could potentially just come from a config the view layer uses.
     */
    async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<MediaItem>> {
        const mediaItemResult = await this.commandRepository.fetchById(id);

        if (isInternalError(mediaItemResult)) {
            throw new InternalError(
                `Media Management Service encoutnered an invalid existing media item`,
                [mediaItemResult]
            );
        }

        if (isNotFound(mediaItemResult)) {
            return NotFound;
        }

        if (!isNonEmptyObject(userWithGroups)) {
            return mediaItemResult.published ? mediaItemResult : NotFound;
        }

        if (
            mediaItemResult.published ||
            mediaItemResult.queryAccessControlList.canUserWithGroups(userWithGroups)
        ) {
            return mediaItemResult;
        }

        return NotFound;
    }

    /**
     * Note that at present this method is intended for use for external
     * state validation. We might want to remove the ability to fetch many
     * for validation in favor of very specific methods that validate the
     * given uniqueness \ existence constraint on media items.
     *
     * This is not meant to be used for general media item queries for the
     * front-end.
     */
    async fetchMany(userWithGroups?: CoscradUserWithGroups): Promise<MediaItem[]> {
        const allAggregates = await this.commandRepository.fetchMany();

        return allAggregates.filter((item): item is MediaItem => {
            if (isInternalError(item)) {
                return false;
            }

            if (item.published) {
                return true;
            }

            if (!isNonEmptyObject(userWithGroups)) {
                return false;
            }

            return item.queryAccessControlList.canUserWithGroups(userWithGroups);
        });
    }
}
