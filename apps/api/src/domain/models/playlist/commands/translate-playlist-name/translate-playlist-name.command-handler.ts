import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../domain/common';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../domain/common/entities/multilingual-text';
import { ICoscradEventPublisher } from '../../../../../domain/common/events/interfaces';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../domain/repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Playlist } from '../../entities';
import { PlaylistNameTranslated } from './playlist-name-translated.event';
import { TranslatePlaylistName } from './translate-playlist-name.command';

@CommandHandler(TranslatePlaylistName)
export class TranslatePlaylistNameCommandHandler extends BaseUpdateCommandHandler<Playlist> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    // note that we don't prevent duplication in translation of a name, only the orignal
    protected async fetchRequiredExternalState(
        _: TranslatePlaylistName
    ): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Playlist
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        playlist: Playlist,
        { text, languageCode }: TranslatePlaylistName
    ): ResultOrError<Playlist> {
        return playlist.translateName(
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }

    protected buildEvent(
        command: TranslatePlaylistName,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new PlaylistNameTranslated(command, eventMeta);
    }
}
