import { Inject } from '@nestjs/common';
import { EdgeConnectionQueryService } from '../domain/services/query-services/edge-connection-query.service';
import { MediaItemQueryService } from '../domain/services/query-services/media-item-query.service';
import { InternalError } from '../lib/errors/InternalError';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    name: 'export-media-annotations',
    description: `export all notes for media items that use time-range context`,
})
/**
 * This particular command is helpful when we want to export clips
 * based on `Notes` with `TimeRangeContext`.
 */
export class ExportMediaAnnotationsCliCommand extends CliCommandRunner {
    constructor(
        private readonly _mediaItemQueryService: MediaItemQueryService,
        private readonly _edgeConnectionQueryService: EdgeConnectionQueryService,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly _logger: ICoscradLogger
    ) {
        super();
    }

    async run(_passedParams: string[]): Promise<void> {
        throw new Error(`not implemented`);
    }

    @CliCommandOption({
        flags: '-e, --exportPath [exportPath]',
        description: 'the path for a new directory to hold the exported data',
        required: true,
    })
    parseExportPath(input: string) {
        return input;
    }

    @CliCommandOption({
        flags: '-m, --mediaType [mediaType]',
        description: `the desired media type ('all', 'audio', or 'video') `,
    })
    parseMediaType(input: string) {
        if (input.toLowerCase() === 'all') {
            return 'all';
        }

        throw new InternalError(
            `Invalid value (${input}) received for argument (mediaItem). \n Must be one of ['all','audio','video']`
        );
    }
}
