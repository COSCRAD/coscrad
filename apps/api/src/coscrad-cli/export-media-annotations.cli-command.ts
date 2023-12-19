import { Inject } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { AudioItemQueryService } from '../domain/services/query-services/audio-item-query.service';
import { VideoQueryService } from '../domain/services/query-services/video-query.service';
import { InternalError } from '../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../queries/presentation/formatAggregateCompositeIdentifier';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type Options = {
    exportPath: string;
};

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
        private readonly audioItemQueryService: AudioItemQueryService,
        private readonly videoQueryService: VideoQueryService,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(_passedParams: string[], { exportPath }: Options): Promise<void> {
        if (!existsSync(exportPath)) mkdirSync(exportPath);

        const audioAnnotations = await this.audioItemQueryService.getAnnotations();

        const videoAnnotations = await this.videoQueryService.getAnnotations();

        const annotations = [...audioAnnotations, ...videoAnnotations];

        if (annotations.length === 0) {
            this.logger.log(`No annotations found.`);

            return;
        }

        this.logger.log(`Attempting to export annotations to: ${exportPath}`);

        for (const annotation of annotations) {
            const { aggregateCompositeIdentifier, labels } = annotation;

            const { type: audioVisualType, id } = aggregateCompositeIdentifier;

            let sequenceNumber = 0;

            for (const _label of labels) {
                // increment first and start at 1
                sequenceNumber++;

                const fullFilePath = `${exportPath}/${audioVisualType}-${id}-${sequenceNumber}.data.json`;

                if (existsSync(fullFilePath)) {
                    const error = new InternalError(
                        `cannot overwrite existing directory: ${exportPath}`
                    );

                    this.logger.log(error.toString());

                    throw error;
                }

                this.logger.log(
                    `Writing label ${sequenceNumber}/${
                        labels.length
                    } for: ${formatAggregateCompositeIdentifier(aggregateCompositeIdentifier)}`
                );

                /**
                 * We want to handle this in a more performant way. It is likely that
                 * we will move to another language \ run time for media and binary
                 * file management in the near future. If not, we should optimize this
                 * code.
                 */
                writeFileSync(
                    // TODO Use the name here
                    fullFilePath,
                    JSON.stringify(annotation, undefined, 4)
                );
            }
        }
    }

    @CliCommandOption({
        flags: '-e, --exportPath [exportPath]',
        description: 'the path for a new directory to hold the exported data',
        required: true,
    })
    parseExportPath(input: string) {
        // TODO Validate path existence here
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

        /**
         * TODO In the future we should support exporting audio or video
         * annotations separately.
         */
        throw new InternalError(
            `Invalid value (${input}) received for argument (mediaItem). \n Must be one of ['all','audio','video']`
        );
    }
}
