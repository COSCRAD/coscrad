import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import { IEvent } from '../../shared/events/interfaces/event.interface';
import { Song } from '../song.entity';
import { PublishSong } from './publish-song.command';
import { SongPublished } from './song-published.event';

@CommandHandler(PublishSong)
export class PublishSongCommandHandler extends BaseUpdateCommandHandler<Song> {
    protected async fetchInstanceToUpdate({ id }: PublishSong): Promise<ResultOrError<Song>> {
        const existingSongSearchResult = await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchById(id);

        if (isNotFound(existingSongSearchResult))
            return new InternalError(`There is no song with the id: ${id}`);

        if (isInternalError(existingSongSearchResult)) {
            throw existingSongSearchResult;
        }

        return existingSongSearchResult;
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

    protected eventFactory(command: PublishSong, eventId: string): IEvent {
        return new SongPublished(command, eventId);
    }
}
