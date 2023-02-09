import { isNonEmptyString, isUUID } from '@coscrad/validation-constraints';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { IIdGenerator } from '../../../../domain/interfaces/id-generator.interface';
import { ID_MANAGER_TOKEN } from '../../../../domain/interfaces/id-manager.interface';
import { AggregateType } from '../../../../domain/types/AggregateType';
import { InternalError } from '../../../../lib/errors/InternalError';
import { AudioRegistrationStrategy } from '../../../../preprocessors/audio-discovery/strategies/audio-registration-strategy.enum';
import { createBulkMediaParser } from '../../../../preprocessors/audio-discovery/strategies/create-command-stream-builder';
import { RegisterMediaItemsRequestBody } from './register-media-items-request-body.entity';

@ApiTags('bulk')
@Controller('bulk')
export class BulkMediaItemRegistrationController {
    constructor(
        @Inject(ID_MANAGER_TOKEN) private readonly idGenerator: IIdGenerator,
        private readonly configService: ConfigService
    ) {}

    @Post('registerMediaItems')
    async registerBulkMediaItemsByFilenames(@Body() body: RegisterMediaItemsRequestBody) {
        const { filenames, strategy, tagId } = body;

        if (!Array.isArray(filenames) || !filenames.every(isNonEmptyString))
            return new InternalError(`Invalid filenames. Must be a string array.`);

        if (!Object.values(AudioRegistrationStrategy).includes(strategy))
            return new InternalError(`Unrecognized audio registration strategy: ${strategy}`);

        if (!isUUID(tagId)) return new InternalError(`Invalid tag ID: ${tagId}`);

        const commandStreamBuilder = createBulkMediaParser(strategy, this.idGenerator, {
            type: AggregateType.tag,
            id: tagId,
        });

        // TODO process all files in a loop
        const result = await commandStreamBuilder.createCommandStream(filenames[0]);

        return result;
    }
}
