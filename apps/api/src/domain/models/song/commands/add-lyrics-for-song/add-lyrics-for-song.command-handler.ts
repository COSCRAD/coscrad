import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../domain/common/events/interfaces';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../../domain/repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Song } from '../../song.entity';
import { AddLyricsForSong } from './add-lyrics-for-song.command';
import { LyricsAddedForSong } from './lyrics-added-for-song.event';

@CommandHandler(AddLyricsForSong)
export class AddLyricsForSongCommandHandler extends BaseUpdateCommandHandler<Song> {
    protected readonly aggregateType: AggregateType = AggregateType.song;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Song>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);

        this.repositoryForCommandsTargetAggregate = repositoryProvider.forResource(
            ResourceType.song
        );
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Song
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        song: Song,
        { lyrics, languageCode }: AddLyricsForSong
    ): ResultOrError<Song> {
        return song.addLyrics(lyrics, languageCode);
    }

    protected buildEvent(command: AddLyricsForSong, eventMeta: EventRecordMetadata): BaseEvent {
        return new LyricsAddedForSong(command, eventMeta);
    }
}
