import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../../../domain/repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Resource } from '../../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { ITranscribable } from '../../../entities/transcribable.mixin';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';
import { LineItemsImportedToTranscript } from './line-items-imported-to-transcript.event';

type TranscribableResource = ITranscribable & Resource;
@CommandHandler(ImportLineItemsToTranscript)
export class ImportLineItemsToTranscriptCommandHandler extends BaseUpdateCommandHandler<TranscribableResource> {
    protected aggregateType: typeof AggregateType.audioItem | typeof AggregateType.video;

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<TranscribableResource>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: TranscribableResource
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        instance: TranscribableResource,
        { lineItems }: ImportLineItemsToTranscript
    ): ResultOrError<TranscribableResource> {
        return instance.importLineItemsToTranscript(
            lineItems.map((lineItem) => ({
                ...lineItem,
                inPoint: lineItem.inPointMilliseconds,
                outPoint: lineItem.outPointMilliseconds,
                text: buildMultilingualTextWithSingleItem(lineItem.text, lineItem.languageCode),
            }))
        ) as unknown as TranscribableResource;
    }

    protected buildEvent(command: ICommand, eventId: string, userId: string): BaseEvent {
        return new LineItemsImportedToTranscript(command, eventId, userId);
    }
}
