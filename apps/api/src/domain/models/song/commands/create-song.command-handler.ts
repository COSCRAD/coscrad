import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { isNotAvailable } from '../../../../lib/types/not-available';
import { isNotFound } from '../../../../lib/types/not-found';
import { isOK } from '../../../../lib/types/ok';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { EVENT_PUBLISHER_TOKEN } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { ICoscradEventPublisher } from '../../../common/events/interfaces';
import { Valid } from '../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../factories/get-instance-factory-for-resource';
import { IMediaManagementService } from '../../../interfaces';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { AudioItem } from '../../audio-visual/audio-item/entities/audio-item.entity';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import UuidNotGeneratedInternallyError from '../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../shared/functional';
import { Song } from '../song.entity';
import { CreateSong } from './create-song.command';
import { SongCreated } from './song-created.event';

/**
 * TODO[https://www.pivotaltracker.com/story/show/182597512]
 * This should leverage the `BaseCreateCommandHandler`
 */
@CommandHandler(CreateSong)
export class CreateSongCommandHandler extends BaseCreateCommandHandler<Song> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Song>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        protected readonly mediaManager: IMediaManagementService,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<Song>(
            ResourceType.song
        );
    }

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        title,
        languageCodeForTitle,
        audioItemId,
    }: CreateSong): ResultOrError<Song> {
        const songDTO: DTO<Song> = {
            id,
            title: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            audioItemId,
            published: false,
            type: ResourceType.song,
            eventHistory: [],
        };

        // Attempt state mutation - Result or Error (Invariant violation in our case- could also be invalid state transition in other cases)
        return getInstanceFactoryForResource<Song>(ResourceType.song)(songDTO);
    }

    /**
     * TODO Optimize this by using filters to pull out only the necessary
     * audio items. Consider if duplicate song titles should be allowed, and if so,
     * fetch only those songs with the same title.
     */
    async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [songSearchResult, audioItemSearchResult] = await Promise.all([
            this.repositoryProvider.forResource<Song>(ResourceType.song).fetchMany(),
            this.repositoryProvider.forResource<AudioItem>(ResourceType.audioItem).fetchMany(),
        ]);

        const allSongs = songSearchResult.filter((song): song is Song => {
            if (isInternalError(song)) {
                throw song;
            }

            return true;
        });

        return new DeluxeInMemoryStore({
            song: allSongs,
            audioItem: audioItemSearchResult.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    validateExternalState(state: InMemorySnapshot, song: Song): ValidationResult {
        // const doesMediaItemExist = await this.mediaManager.exists(mediaItemId);

        return song.validateExternalState(state);
    }

    /**
     * Where should we do this? It seems natural to do this as part of the
     * `create` call to the repository.
     */
    async validateAdditionalConstraints(command: CreateSong): Promise<ValidationResult> {
        const {
            aggregateCompositeIdentifier: { id: newId },
        } = command;

        // Validate that new ID was generated by our system and is available
        const idStatus = await this.idManager.status(newId);

        if (isNotFound(idStatus)) return new UuidNotGeneratedInternallyError(newId);

        if (isNotAvailable(idStatus))
            return new InternalError(
                `The id: ${newId} is already in use by another resource in our system.`
            );

        if (!isOK(idStatus)) {
            // This is out of an abundance of caution. We shouldn't hit this.
            throw new InternalError(`Unrecognized status for id: ${String(idStatus)}`);
        }

        return Valid;
    }

    protected buildEvent(command: CreateSong, eventMeta: EventRecordMetadata): BaseEvent {
        return new SongCreated(command, eventMeta);
    }
}
