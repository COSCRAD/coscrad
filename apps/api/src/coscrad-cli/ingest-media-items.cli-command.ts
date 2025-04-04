import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateType,
    ICommandBase,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { MIMEType } from '@coscrad/data-types';
import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject, NotImplementedException } from '@nestjs/common';
import { copyFileSync, existsSync, readdirSync } from 'fs';
import { CommandFSA } from '../app/controllers/command/command-fsa/command-fsa.entity';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { CreateAudioItem } from '../domain/models/audio-visual/audio-item/commands';
import { isAudioMimeType } from '../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { CreateVideo } from '../domain/models/audio-visual/video';
import { isVideoMimeType } from '../domain/models/audio-visual/video/entities/video.entity';
import { CreateMediaItem } from '../domain/models/media-item/commands/create-media-item/create-media-item.command';
import {
    getExpectedMimeTypeFromExtension,
    getExtensionForMimeType,
} from '../domain/models/media-item/entities/get-extension-for-mime-type';
import { MediaItemDimensions } from '../domain/models/media-item/entities/media-item-dimensions';
import { CreatePhotograph } from '../domain/models/photograph';
import { isPhotographMimeType } from '../domain/models/photograph/entities/photograph.entity';
import {
    IMediaProber,
    MEDIA_PROBER_TOKEN,
} from '../domain/services/query-services/media-management';
import { AggregateId } from '../domain/types/AggregateId';
import { ResourceType } from '../domain/types/ResourceType';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { NotFound, isNotFound } from '../lib/types/not-found';
import clonePlainObjectWithoutProperty from '../lib/utilities/clonePlainObjectWithoutProperty';
import formatAggregateCompositeIdentifier from '../queries/presentation/formatAggregateCompositeIdentifier';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

interface IngestMediaItemsCliCommandOptions {
    directory: string;
    baseUrl: string;
    staticAssetDestinationDirectory: string;
    publish?: boolean;
    createResources?: boolean;
    tags?: string[];
}

const buildCreateResourceFsaForMediaItem = (
    {
        aggregateCompositeIdentifier: { id: mediaItemId },
        title,
        mimeType,
        lengthMilliseconds,
        heightPx,
        widthPx,
    }: CreateMediaItem,
    generatedId: AggregateId
): CommandFSA<ICommandBase> => {
    if (isNullOrUndefined(generatedId)) {
        throw new Error(`missing id`);
    }

    if (isAudioMimeType(mimeType)) {
        const fsa: CommandFSA<CreateAudioItem> = {
            type: `CREATE_AUDIO_ITEM`,
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.audioItem,
                    id: generatedId,
                },
                name: title,
                // this is the only choice for media item titles currently
                languageCodeForName: LanguageCode.English,
                lengthMilliseconds,
                mediaItemId,
            },
        };

        return fsa;
    }

    if (isVideoMimeType(mimeType)) {
        const fsa: CommandFSA<CreateVideo> = {
            type: `CREATE_VIDEO`,
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.video,
                    id: generatedId,
                },
                name: title,
                languageCodeForName: LanguageCode.English,
                lengthMilliseconds,
                mediaItemId,
            },
        };

        return fsa;
    }

    if (isPhotographMimeType(mimeType)) {
        const fsa: CommandFSA<CreatePhotograph> = {
            type: `CREATE_PHOTOGRAPH`,
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.photograph,
                    id: generatedId,
                },
                title,
                languageCodeForTitle: LanguageCode.English,
                mediaItemId,
                // TODO What should we do about this? Maybe it is indicated in the filename? The real metadata? Should be optional?
                photographer: 'unknown',
                heightPx,
                widthPx,
            },
        };

        return fsa;
    }
};

/**
 * TODO We should to either:
 * 1. Use the async fs APIs to optimize this
 * 2. Expose an `ingest-media-item` (singular) so that we can use, e.g., GNU parallel
 * for performance instead.
 */
@CliCommand({
    name: 'ingest-media-items',
    description: 'ingest all media items within a target directory',
})
export class IngestMediaItemsCliCommand extends CliCommandRunner {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(MEDIA_PROBER_TOKEN) private readonly mediaProber: IMediaProber,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(
        _passedParams: string[],
        {
            directory,
            staticAssetDestinationDirectory,
            publish: shouldPublishMediaItems = false,
            createResources: shouldCreateResources = false,
            tags = [],
        }: IngestMediaItemsCliCommandOptions
    ): Promise<void> {
        this.logger.log(`Attempting to import media from: ${directory}`);

        /**
         * TODO We should consider using the async API for performance.
         */
        const partialPayloads: (Omit<CreateMediaItem, 'aggregateCompositeIdentifier' | 'url'> & {
            filename: string;
        })[] = readdirSync(directory).map((file) => {
            const nameAndExtension = file.split('.');

            if (nameAndExtension.length !== 2) {
                throw new InternalError(`Failed to parse filename: ${file}`);
            }

            const [name, extension] = nameAndExtension;

            return {
                title: name,
                /**
                 * TODO This is not secure, but we are not exposing this publicly. Right now,
                 * we are only ingesting trusted media items over local host to test out the
                 * media annotation flow. In the future, we will need to validate the MIME Type
                 * from the binary data.
                 */
                mimeType: getExpectedMimeTypeFromExtension(extension) as MIMEType,
                filename: file,
            };
        });

        /**
         * For each media item we create a media item and link it to one of the
         * media resources (`AudioItem`, `Video`, or `Photograph`).
         */
        const generatedIds = await this.idManager.generateMany(partialPayloads.length * 2);

        const durationMap = new Map<string, number>();

        const dimensionsMap = new Map<string, MediaItemDimensions>();

        const isMediaResourceMimeType = (mimeType: MIMEType) =>
            [isPhotographMimeType, isAudioMimeType, isVideoMimeType].some((predicate) =>
                predicate(mimeType)
            );

        for (const { filename, mimeType } of partialPayloads) {
            const mediaInfo = !isMediaResourceMimeType(mimeType)
                ? NotFound
                : await this.mediaProber.probe(`${directory}/${filename}`);

            if (isNotFound(mediaInfo)) {
                this.logger.log(`the prober found no media info for: ${filename}`);

                continue;
            }

            /**
             * TODO Determine the MIME Type with the probe
             * [see here](https://gist.github.com/DusanBrejka/35238dccb5cefcc804de1c5a218ee004)
             */
            const { durationSeconds, heightPx, widthPx } = mediaInfo;

            if (
                !isNullOrUndefined(durationSeconds) &&
                (isVideoMimeType(mimeType) || isAudioMimeType(mimeType))
            ) {
                durationMap.set(filename, durationSeconds);
            }

            if (
                !isNullOrUndefined(heightPx) &&
                !isNullOrUndefined(widthPx) &&
                isPhotographMimeType(mimeType)
            ) {
                dimensionsMap.set(filename, new MediaItemDimensions({ widthPx, heightPx }));
            }
        }

        const createMediaItemFsas: CommandFSA<CreateMediaItem>[] = partialPayloads.map(
            (partialFsa, index) => {
                const { filename } = partialFsa;

                const lengthSeconds = durationMap.get(filename);

                const dimensions = dimensionsMap.get(filename);

                // TODO[https://www.pivotaltracker.com/story/show/186713518] Use a math lib
                const MILLISECONDS_PER_SECOND = 1000;

                const id = generatedIds[index];

                return {
                    type: `CREATE_MEDIA_ITEM`,
                    payload: {
                        ...clonePlainObjectWithoutProperty(partialFsa, 'filename'),
                        aggregateCompositeIdentifier: {
                            type: ResourceType.mediaItem,
                            id,
                        },
                        rawData: {
                            filename,
                        },
                        ...(isNullOrUndefined(lengthSeconds)
                            ? {}
                            : {
                                  lengthMilliseconds: lengthSeconds * MILLISECONDS_PER_SECOND,
                              }),
                        ...(isNullOrUndefined(dimensions) ? {} : dimensions),
                    } as const,
                };
            }
        );

        const createResourceFsas = shouldCreateResources
            ? createMediaItemFsas
                  /**
                   * We only want to create corresponding media resources when the MIME Type
                   * corresponds to a audio, video, or photograph.
                   */
                  .filter(({ payload: { mimeType } }) => isMediaResourceMimeType(mimeType))
                  .map((createMediaItemFsa, index) => {
                      const idToUse = generatedIds[index + partialPayloads.length];

                      return buildCreateResourceFsaForMediaItem(
                          createMediaItemFsa.payload,
                          idToUse
                      );
                  })
            : [];

        /**
         * TODO[Performance] We should consider another pattern such as a promise
         * queue. In the long run, we may manage media using a different language
         * and run-time, so we won't invest much time in this as long as the
         * performance is acceptable for current needs.
         */
        for (const fsa of createMediaItemFsas) {
            const result = await this.commandHandlerService.execute(fsa, {
                userId: 'COSCRAD Admin',
            });

            if (isInternalError(result)) {
                const message = `failed to import media at first invalid request`;

                const topLevelError = new InternalError(message, [result]);

                this.logger.log(topLevelError.toString());

                throw topLevelError;
            }

            this.logger.log(
                `Media Item Added: ${JSON.stringify(fsa.payload.aggregateCompositeIdentifier.id)}`
            );

            // publish media item, if this was requested
            if (shouldPublishMediaItems) {
                const publicationResult = await this.commandHandlerService.execute(
                    {
                        type: 'PUBLISH_RESOURCE',
                        payload: {
                            aggregateCompositeIdentifier: fsa.payload.aggregateCompositeIdentifier,
                        },
                    },
                    {
                        userId: 'COSCRAD Admin',
                    }
                );

                if (isInternalError(publicationResult)) {
                    const error = new InternalError(
                        `Failed to import media item: ${fsa.payload.aggregateCompositeIdentifier.id} at the publication stage`,
                        [publicationResult]
                    );

                    this.logger.log(error.toString());

                    throw error;
                }
            }

            // tag media item, if this was requested
            if (tags.length > 0) {
                throw new NotImplementedException(
                    `We do not yet support tagging media items during ingestion`
                );
            }

            const {
                payload: {
                    title,
                    mimeType,
                    rawData: { filename },
                },
            } = fsa;

            const destinationPath = `${staticAssetDestinationDirectory}/${title}.${getExtensionForMimeType(
                mimeType
            )}`;

            if (existsSync(destinationPath)) {
                this.logger.log(`Skipping file (already exists): ${destinationPath}`);
            } else {
                copyFileSync(`${directory}/${filename}`, destinationPath);
            }
        }

        /**
         * Note that if `shouldCreateResources == false`, `createResourceFsas`
         * will be empty and no work will be done here.
         */
        for (const fsa of createResourceFsas) {
            const result = await this.commandHandlerService.execute(fsa, {
                userId: 'COSCRAD Admin',
            });

            if (isInternalError(result)) {
                const message = `failed to [${fsa.type}] for ${formatAggregateCompositeIdentifier(
                    fsa.payload[AGGREGATE_COMPOSITE_IDENTIFIER]
                )}`;

                const topLevelError = new InternalError(message, [result]);

                this.logger.log(topLevelError.toString());

                this.logger.log(`failed payload: ${JSON.stringify(fsa)}`);

                throw topLevelError;
            }

            const publicationResult = await this.commandHandlerService.execute(
                {
                    type: 'PUBLISH_RESOURCE',
                    payload: {
                        aggregateCompositeIdentifier: fsa.payload.aggregateCompositeIdentifier,
                    },
                },
                {
                    userId: 'COSCRAD Admin',
                }
            );

            if (isInternalError(publicationResult)) {
                const error = new InternalError(
                    `Failed to create resource: ${formatAggregateCompositeIdentifier(
                        fsa.payload[AGGREGATE_COMPOSITE_IDENTIFIER]
                    )} at the publication stage`,
                    [publicationResult]
                );

                this.logger.log(error.toString());

                throw error;
            }

            this.logger.log(
                `${formatAggregateCompositeIdentifier(
                    fsa.payload[AGGREGATE_COMPOSITE_IDENTIFIER]
                )} Added: ${JSON.stringify(fsa)}`
            );
        }
    }

    @CliCommandOption({
        flags: '-d, --directory [directory]',
        description: 'the path to the source directory with media items',
        required: true,
    })
    parseDirectory(input: string): string {
        return input;
    }

    @CliCommandOption({
        flags: '-b, --baseUrl [baseUrl]',
        description: 'the base URL for the media server',
        required: true,
    })
    parseBaseUrl(input: string): string {
        return input;
    }

    @CliCommandOption({
        flags: '-s, --staticAssetDestinationDirectory [staticAssetDestinationDirectory]',
        description: 'the destination to which the files should be copied (and renamed)',
        required: true,
    })
    parseStaticAssetDestinationDirectory(input: string): string {
        if (!existsSync(input)) {
            const error = new InternalError(`Failed to copy assets: ${input} directory not found`);

            this.logger.log(error.toString());

            throw error;
        }

        return isNonEmptyString(input) ? input : undefined;
    }

    @CliCommandOption({
        flags: '-p, --publish [publish]',
        description: 'should the media item be published?',
        required: false,
    })
    parsePublish(input: string): boolean {
        return JSON.parse(input);
    }

    @CliCommandOption({
        flags: '-c, --createResources [createResources]',
        description:
            'should corresponding resources (e.g., audio, video, or photograph) be created?',
        required: false,
    })
    parseCreateResources(input: string): boolean {
        return JSON.parse(input);
    }

    @CliCommandOption({
        flags: '-t, --tags [tags]',
        description: 'a comma separated list of tags (by label) to apply to all media items',
        required: false,
    })
    parseTags(input: string): string[] {
        if (!isNonEmptyString(input)) return [];

        if (input.charAt(0) === '"' && input.charAt(input.length - 1) === '"') {
            input = input.slice(1, input.length - 1);
        }

        return input.split(',');
    }
}
