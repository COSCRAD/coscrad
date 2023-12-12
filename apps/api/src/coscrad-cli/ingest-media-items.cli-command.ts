import { CommandHandlerService } from '@coscrad/commands';
import { MIMEType } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import { readdirSync } from 'fs';
import { CommandFSA } from '../app/controllers/command/command-fsa/command-fsa.entity';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { CreateMediaItem } from '../domain/models/media-item/commands/create-media-item.command';
import { AggregateType } from '../domain/types/AggregateType';
import { InternalError } from '../lib/errors/InternalError';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

interface IngestMediaItemsCliCommandOptions {
    directory: string;
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
        { directory }: IngestMediaItemsCliCommandOptions
    ): Promise<void> {
        this.logger.log(`Attempting to import media from: ${directory}`);

        const partialPayload: Omit<CreateMediaItem, 'aggregateCompositeIdentifier' | 'url'>[] =
            readdirSync(directory).map((file) => ({
                title: file.split('.')[0],
                // TODO Be more careful about the file name parsing
                mimeType: this.determineMimeType(file.split('.')[1]),
            }));

        // TODO Do this in one go for efficiency
        const generatedIds = await Promise.all(
            Array(partialPayload.length).map((_) => this.idManager.generate())
        );

        const createMediaItemFsas: CommandFSA<CreateMediaItem>[] = partialPayload.map(
            (partialFsa, index) => ({
                type: `CREATE_MEDIA_ITEM`,
                payload: {
                    ...partialFsa,
                    aggregateCompositeIdentifier: {
                        type: AggregateType.mediaItem,
                        id: generatedIds[index],
                    },
                    url: `${generatedIds[index]}`, // TODO append extension
                    rawData: {}, // TODO Add me
                },
            })
        );

        createMediaItemFsas.forEach(async (fsa) => {
            await this.commandHandlerService.execute(fsa);
        });
    }

    @CliCommandOption({
        flags: '-d, --directory [directory]',
        description: 'the path to the source directory with media items',
        required: true,
    })
    parseDirectory(input: string): string {
        return input;
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

        if (extension === 'mp4') return MIMEType.mp4;

        if (extension === 'png') return MIMEType.png;

        throw new InternalError(`Unsupported file extension: ${extension}`);
    }
}
