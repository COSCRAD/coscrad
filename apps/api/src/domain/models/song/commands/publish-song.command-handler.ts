import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { Song } from '../song.entity';
import { PublishSong } from './publish-song.command';
import { SongPublished } from './song-published.event';

@CommandHandler(PublishSong)
export class PublishSongCommandHandler extends BaseUpdateCommandHandler<Song> {
    protected readonly resourceType = ResourceType.song;

    actOnInstance(song: Song): ResultOrError<Song> {
        return song.publish();
    }

    async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return buildInMemorySnapshot({});
    }

    validateExternalState(_: InMemorySnapshot, __: Song): Valid | InternalError {
        return Valid;
    }

    protected eventFactory(command: PublishSong, eventId: string): BaseEvent {
        return new SongPublished(command, eventId);
    }
}
