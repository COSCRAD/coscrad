import { Ack, CommandHandler, ICommandHandler } from '@coscrad/commands';
import { buildSimpleValidationFunction } from '@coscrad/validation';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { IIdGenerator } from '../../../interfaces/id-generator.interface';
import { ResourceType } from '../../../types/ResourceType';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { Song } from '../song.entity';
import { PublishSong } from './publish-song.command';
import { SongPublished } from './song-published.event';

@CommandHandler(PublishSong)
export class PublishSongCommandHandler implements ICommandHandler {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') private readonly idGenerator: IIdGenerator
    ) {}

    async execute(command: PublishSong): Promise<Ack | InternalError> {
        const payloadTypeErrors = buildSimpleValidationFunction(
            Object.getPrototypeOf(command).constructor
        )(command).map(
            (simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`)
        );

        if (payloadTypeErrors.length > 0) {
            return new InvalidCommandPayloadTypeError('PUBLISH_SONG', payloadTypeErrors);
        }

        // validate external state
        const { id } = command;

        const searchResult = await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchById(id);

        if (isInternalError(searchResult)) {
            throw new InternalError(`Encountered an error when fetching song: ${id}`, [
                searchResult,
            ]);
        }

        if (isNotFound(searchResult)) {
            return new InternalError(`There is no song with id: ${id}`);
        }

        const updatedInstance = searchResult.publish();

        // the model checks if the state transition is allowed and if invariants are still satisfied
        if (isInternalError(updatedInstance)) {
            return updatedInstance;
        }

        const eventId = await this.idGenerator.generate();

        const instanceToCreateWithEventHistory = updatedInstance.addEventToHistory(
            new SongPublished(command, eventId)
        );

        await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .update(instanceToCreateWithEventHistory);

        return Ack;
    }
}
