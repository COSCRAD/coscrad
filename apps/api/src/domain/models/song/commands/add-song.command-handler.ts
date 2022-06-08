import { Ack, CommandHandler, ICommandHandler } from '@coscrad/commands';
import { buildSimpleValidationFunction } from '@coscrad/validation';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../types/DTO';
import getInstanceFactoryForEntity from '../../../factories/getInstanceFactoryForEntity';
import { IIdGenerator } from '../../../interfaces/id-generator.interface';
import { ResourceType } from '../../../types/ResourceType';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { Song } from '../song.entity';
import { AddSong } from './add-song.command';
import { SongCreated } from './song-created.event';

@CommandHandler(AddSong)
export class AddSongHandler implements ICommandHandler {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_GENERATOR') private readonly idGenerator: IIdGenerator
    ) {}

    async execute(command: AddSong): Promise<Ack | InternalError> {
        // Validate command type
        const payloadTypeErrors = buildSimpleValidationFunction(
            Object.getPrototypeOf(command).constructor
        )(command).map(
            (simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`)
        );

        if (payloadTypeErrors.length > 0) {
            return new InvalidCommandPayloadTypeError('ADD_SONG', payloadTypeErrors);
        }

        // Validate external state
        const { id } = command;

        const existingSongWithTheId = await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchById(id);

        if (isInternalError(existingSongWithTheId)) {
            throw new InternalError(`Encountered an error when fetching song: ${id}`);
        }

        if (existingSongWithTheId !== NotFound) {
            return new InternalError(`There is already a song with ID: ${id}`);
        }

        const songDTO: DTO<Song> = {
            ...command,
            published: false,
            startMilliseconds: 0,
            type: ResourceType.song,
            eventHistory: [],
        };

        // Attempt state mutation - Result or Error (Invariant violation in our case- could also be invalid state transition in other cases)
        const instanceToPersist = getInstanceFactoryForEntity<Song>(ResourceType.song)(songDTO);

        // Does this violate invariants?
        if (isInternalError(instanceToPersist)) {
            return instanceToPersist;
        }

        // generate a unique ID for the event
        const eventId = await this.idGenerator.generate();

        const instanceToPersistWithUpdatedEventHistory = instanceToPersist.addEventToHistory(
            new SongCreated(command, eventId)
        );

        // Persist the valid instance
        await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .create(instanceToPersistWithUpdatedEventHistory);

        return Ack;
    }
}
