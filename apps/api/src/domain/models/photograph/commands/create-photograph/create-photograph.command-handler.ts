import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { MediaItemDimensions } from '../../../media-item/entities/media-item-dimensions';
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
        title,
        languageCodeForTitle,
        mediaItemId,
        photographer,
        heightPx,
        widthPx,
    }: CreatePhotograph): ResultOrError<Photograph> {
        const newInstance = new Photograph({
            type: AggregateType.photograph,
            id,
            title: buildMultilingualTextWithSingleItem(title, languageCodeForTitle),
            mediaItemId,
            dimensions: new MediaItemDimensions({
                heightPx,
                widthPx,
            }),
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

    protected async fetchRequiredExternalState({
        mediaItemId,
    }: CreatePhotograph): Promise<InMemorySnapshot> {
        const mediaItemSearchResult = await this.repositoryProvider
            .forResource(AggregateType.mediaItem)
            .fetchById(mediaItemId);

        if (isInternalError(mediaItemSearchResult)) {
            throw new InternalError(
                `Found invalid media item when attempting to create a photograph`,
                [mediaItemSearchResult]
            );
        }

        return Promise.resolve(
            new DeluxeInMemoryStore({
                [AggregateType.mediaItem]: isNotFound(mediaItemSearchResult)
                    ? []
                    : [mediaItemSearchResult],
            }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: Photograph
    ): InternalError | Valid {
        // note that the reference to a media item is validated in the base handler via the schema
        return instance.validateExternalReferences(state);
    }

    protected buildEvent(
        payload: CreatePhotograph,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new PhotographCreated(payload, eventMeta);
    }
}
