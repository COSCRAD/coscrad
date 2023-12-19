import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Photograph } from '../../entities/photograph.entity';
import { CreatePhotograph } from './create-photograph.command';
import { PhotographCreated } from './photograph-created.event';

@CommandHandler(CreatePhotograph)
export class CreatePhotographCommandHandler extends BaseCreateCommandHandler<Photograph> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        title: titleText,
        languageCodeForTitle,
        mediaItemId,
        photographer,
    }: CreatePhotograph): ResultOrError<Photograph> {
        const newInstance = new Photograph({
            type: AggregateType.photograph,
            id,
            title: buildMultilingualTextWithSingleItem(titleText, languageCodeForTitle),
            mediaItemId,
            // TODO Deal with this properly
            dimensions: {
                heightPX: 0,
                widthPX: 0,
            },
            photographer,
            published: false,
        });

        /**
         * We could easily do this in the base handler with no need for complicated
         * factories \ switching on aggregate type.
         */
        const validationResult = newInstance.validateInvariants();

        return isInternalError(validationResult) ? validationResult : newInstance;
    }

    protected fetchRequiredExternalState(_command?: CreatePhotograph): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat());
    }
    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Photograph
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: CreatePhotograph,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new PhotographCreated(payload, eventMeta);
    }
}
