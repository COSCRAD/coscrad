import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Song } from '../../song.entity';
import { SongLyricsTranslated } from './song-lyrics-translated.event';
import { TranslateSongLyrics } from './translate-song-lyrics.command';

@CommandHandler(TranslateSongLyrics)
export class TranslateSongLyricsCommandHandler extends BaseUpdateCommandHandler<Song> {
    protected readonly aggregateType: AggregateType = AggregateType.song;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Song>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = repositoryProvider.forResource(
            ResourceType.song
        );
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Song
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        song: Song,
        { translation, languageCode }: TranslateSongLyrics
    ): ResultOrError<Song> {
        return song.translateLyrics(translation, languageCode);
    }

    protected buildEvent(command: TranslateSongLyrics, eventMeta: EventRecordMetadata): BaseEvent {
        return new SongLyricsTranslated(command, eventMeta);
    }
}
