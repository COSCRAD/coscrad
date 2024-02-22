import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import { IRepositoryForAggregate } from '../../../../../../repositories/interfaces/repository-for-aggregate.interface';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import { Resource } from '../../../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { ITranscribable } from '../../../entities/transcribable.mixin';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';
import { LineItemsImportedToTranscript } from './line-items-imported-to-transcript.event';

type TranscribableResource = ITranscribable & Resource;
@CommandHandler(ImportLineItemsToTranscript)
export class ImportLineItemsToTranscriptCommandHandler extends BaseUpdateCommandHandler<TranscribableResource> {
    protected aggregateType: typeof AggregateType.audioItem | typeof AggregateType.video;

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<TranscribableResource>;

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

    protected buildEvent(
        command: ImportLineItemsToTranscript,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new LineItemsImportedToTranscript(command, eventMeta);
    }
}
