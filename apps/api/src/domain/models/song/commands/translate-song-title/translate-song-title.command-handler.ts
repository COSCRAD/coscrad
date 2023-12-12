import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
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
import { SongTitleTranslated } from './song-title-translated.event';
import { TranslateSongTitle } from './translate-song-title.command';

@CommandHandler(TranslateSongTitle)
export class TranslateSongTitleCommandHandler extends BaseUpdateCommandHandler<Song> {
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
        { translation, languageCode }: TranslateSongTitle
    ): ResultOrError<Song> {
        return song.translateTitle(translation, languageCode);
    }

    protected buildEvent(command: TranslateSongTitle, eventMeta: EventRecordMetadata): BaseEvent {
        return new SongTitleTranslated(command, eventMeta);
    }
}
