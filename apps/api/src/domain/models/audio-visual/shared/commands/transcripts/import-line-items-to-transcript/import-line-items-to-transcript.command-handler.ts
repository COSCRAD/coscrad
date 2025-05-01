import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../../../../common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import { IRepositoryForAggregate } from '../../../../../../repositories/interfaces/repository-for-aggregate.interface';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';
import { LineItemsImportedToTranscript } from './line-items-imported-to-transcript.event';

type TranscribableResource = AudioItem | Video;
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
        if (Array.isArray(lineItems) && lineItems.length === 0) {
            /**
             * TODO This should be caught at the schema based validation instead.
             */
            return new InternalError(
                `You must provide at least one line item when importing to a transcript`
            );
        }

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
