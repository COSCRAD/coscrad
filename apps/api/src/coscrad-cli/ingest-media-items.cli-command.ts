import { CommandHandlerService } from '@coscrad/commands';
import { MIMEType } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { copyFileSync, existsSync, readdirSync } from 'fs';
import { CommandFSA } from '../app/controllers/command/command-fsa/command-fsa.entity';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { CreateMediaItem } from '../domain/models/media-item/commands/create-media-item.command';
import { ResourceType } from '../domain/types/ResourceType';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import clonePlainObjectWithoutProperty from '../lib/utilities/clonePlainObjectWithoutProperty';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

interface IngestMediaItemsCliCommandOptions {
    directory: string;
    baseUrl: string;
    staticAssetDestinationDirectory: string;
}

@CliCommand({
    name: 'ingest-media-items',
    description: 'ingest all media items within a target directory',
})
export class IngestMediaItemsCliCommand extends CliCommandRunner {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(
        _passedParams: string[],
        { directory, baseUrl, staticAssetDestinationDirectory }: IngestMediaItemsCliCommandOptions
    ): Promise<void> {
        this.logger.log(`Attempting to import media from: ${directory}`);

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
                mimeType: this.determineMimeType(extension),
                filename: file,
            };
        });

        const generatedIds = await this.idManager.generateMany(partialPayloads.length);

        const createMediaItemFsas: CommandFSA<CreateMediaItem>[] = partialPayloads.map(
            (partialFsa, index) => {
                const { filename } = partialFsa;

                return {
                    type: `CREATE_MEDIA_ITEM`,
                    payload: {
                        ...clonePlainObjectWithoutProperty(partialFsa, 'filename'),
                        aggregateCompositeIdentifier: {
                            type: ResourceType.mediaItem,
                            id: generatedIds[index],
                        },
                        url: `${baseUrl}/${generatedIds[index]}`,
                        rawData: {
                            filename,
                        },
                    } as const,
                };
            }
        );

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
                const message = `failed to import media atimportimport clonePlainObjectWithoutProperty from '../lib/utilities/clonePlainObjectWithoutProperty';
 { clonePlainObjectWithoutProperties } from '../lib/utilities/clonePlainObjectWithoutProperties';
 first invalid request`;

                const topLevelError = new InternalError(message, [result]);

                this.logger.log(topLevelError.toString());

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
                    `Failed to import media item: ${fsa.payload.aggregateCompositeIdentifier.id} at the publication stage`,
                    [publicationResult]
                );

                this.logger.log(error.toString());

                throw error;
            }

            this.logger.log(`Media Item Added: ${JSON.stringify(fsa)}`);

            const {
                payload: {
                    title,
                    mimeType,
                    rawData: { filename },
                },
            } = fsa;

            const destinationPath = `${staticAssetDestinationDirectory}/${title}.${this.getFileExtensionForMimeType(
                mimeType
            )}`;

            if (existsSync(destinationPath)) {
                this.logger.log(`Skipping file (already exists): ${destinationPath}`);
            } else {
                copyFileSync(`${directory}/${filename}`, destinationPath);
            }
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

    /**
     * TODO This is not secure, but we are not exposing this publicly. Right now,
     * we are only ingesting trusted media items over local host to test out the
     * media annotation flow. In the future, we will need to validate the MIME Type
     * from the binary data.
     */
    private determineMimeType(extension: string): MIMEType {
        if (extension === 'mp3') return MIMEType.mp3;

        if (extension === 'wav') return MIMEType.wav;

        if (extension === 'ogg') return MIMEType.audioOgg;

        if (extension === 'mp4') return MIMEType.mp4;

        if (extension === 'png') return MIMEType.png;

        throw new InternalError(`Unsupported file extension: ${extension}`);
    }

    private getFileExtensionForMimeType(mimetype: MIMEType): string {
        const lookupTable = {
            [MIMEType.audioOgg]: 'ogg',
            [MIMEType.mp3]: 'mp3',
            [MIMEType.wav]: 'wav',
            [MIMEType.mp4]: 'mp4',
            [MIMEType.png]: 'png',
            // is this correct?
            [MIMEType.videoOgg]: 'ogg',
            // [MIMEType.videoWebm]
        };

        const lookupResult = lookupTable[mimetype];

        if (isNullOrUndefined(lookupResult)) {
            const error = new InternalError(
                `Cannot build extension for unsupported MIME type: ${mimetype}`
            );

            this.logger.log(error.toString());

            throw error;
        }

        return lookupResult;
    }
}
