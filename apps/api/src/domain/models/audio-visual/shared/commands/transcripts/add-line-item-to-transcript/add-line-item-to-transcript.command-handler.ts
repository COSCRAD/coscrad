import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import {
    EVENT_PUBLISHER_TOKEN,
    ICoscradEventPublisher,
} from '../../../../../../../domain/common/events/interfaces';
import { BaseUpdateCommandHandler } from '../../../../../../../domain/models/shared/command-handlers/base-update-command-handler';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';
import { LineItemAddedToTranscript } from './line-item-added-to-transcript.event';

export type TranscribableResource = AudioItem | Video;

@CommandHandler(AddLineItemToTranscript)
export class AddLineItemtoTranscriptCommandHandler extends BaseUpdateCommandHandler<TranscribableResource> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier,
    }: AddLineItemToTranscript): Promise<ResultOrError<TranscribableResource>> {
        const { type: resourceType, id } = aggregateCompositeIdentifier;

        const searchResult = await this.repositoryProvider.forResource(resourceType).fetchById(id);

        if (isNotFound(searchResult)) return new AggregateNotFoundError({ type: resourceType, id });

        return searchResult as TranscribableResource;
    }

    protected actOnInstance(
        instance: TranscribableResource,
        {
            inPointMilliseconds,
            outPointMilliseconds,
            text,
            languageCode,
            speakerInitials,
        }: AddLineItemToTranscript
    ): ResultOrError<TranscribableResource> {
        return instance.addLineItemToTranscript({
            inPointMilliseconds: inPointMilliseconds,
            outPointMilliseconds: outPointMilliseconds,
            // to add more items, run a translate command
            text: buildMultilingualTextWithSingleItem(text, languageCode),
            speakerInitials,
        }) as unknown as TranscribableResource;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: TranscribableResource
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddLineItemToTranscript,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new LineItemAddedToTranscript(command, eventMeta);
    }
}
