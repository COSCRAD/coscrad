import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { Song } from '../song.entity';
import { PublishSong } from './publish-song.command';
import { SongPublished } from './song-published.event';

/**
 * This command is deprecated and will be removed in favour of `PUBLISH_RESOURCE`.
 *
 * TODO[https://www.pivotaltracker.com/story/show/184111389]
 * Remove this command handler once the new command has been written.
 */
// @CommandHandler(PublishSong)
export class PublishSongCommandHandler extends BaseUpdateCommandHandler<Song> {
    protected readonly aggregateType = ResourceType.song;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Song>;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<Song>(
            ResourceType.song
        );
    }

    actOnInstance(song: Song): ResultOrError<Song> {
        return song.publish();
    }

    async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return buildInMemorySnapshot({});
    }

    validateExternalState(_: InMemorySnapshot, __: Song): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(command: PublishSong, eventId: string, userId: AggregateId): BaseEvent {
        return new SongPublished(command, eventId, userId);
    }
}
