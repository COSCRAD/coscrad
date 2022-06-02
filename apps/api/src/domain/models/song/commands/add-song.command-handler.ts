import { Ack, CommandHandler, ICommandHandler } from '@coscrad/commands';
import { buildSimpleValidator } from '@coscrad/validation';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../types/DTO';
import getInstanceFactoryForEntity from '../../../factories/getInstanceFactoryForEntity';
import { ResourceType } from '../../../types/ResourceType';
import { Song } from '../song.entity';
import { AddSong } from './add-song.command';

@CommandHandler(AddSong)
export class AddSongHandler implements ICommandHandler {
    constructor(private readonly repositoryProvider: RepositoryProvider) {}

    async execute(command: AddSong): Promise<Ack | Error> {
        // Validate command type
        const payloadTypeErrors = buildSimpleValidator(Object.getPrototypeOf(command).constructor)(
            command
        ).map(
            (simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`)
        );

        if (payloadTypeErrors.length > 0) {
            return new InternalError(
                `Invalid command payload type. See inner errors for more details.`,
                payloadTypeErrors
            );
        }

        // Validate external state
        const { id } = command;

        const existingSongWithTheId = await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchById(id);

        if (existingSongWithTheId !== NotFound) {
            return new InternalError(`There is already a song with ID: ${id}`);
        }

        const songDTO: DTO<Song> = {
            ...command,
            published: false,
            startMilliseconds: 0,
            type: ResourceType.song,
        };

        // Attempt state mutation - Result or Error (Invariant violation in our case- could also be invalid state transition in other cases)
        const instanceToCreate = getInstanceFactoryForEntity<Song>(ResourceType.song)(songDTO);

        // Does this violate invariants?
        if (isInternalError(instanceToCreate)) {
            return instanceToCreate;
        }

        // Persist the valid instance
        await this.repositoryProvider.forResource<Song>(ResourceType.song).create(instanceToCreate);

        return Ack;
    }
}
