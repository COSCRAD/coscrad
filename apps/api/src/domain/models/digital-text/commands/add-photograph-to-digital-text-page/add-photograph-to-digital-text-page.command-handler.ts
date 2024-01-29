import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities';
import { AddPhotographToDigitalTextPage } from './add-photograph-to-digital-text-page.command';
import { PhotographAddedToDigitalTextPage } from './photograph-added-to-digital-text-page.event';

@CommandHandler(AddPhotographToDigitalTextPage)
export class AddPhotographToDigitalTextPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected async fetchRequiredExternalState({
        photographId,
    }: AddPhotographToDigitalTextPage): Promise<InMemorySnapshot> {
        const photographSearchResult = await this.repositoryProvider
            .forResource(AggregateType.photograph)
            .fetchById(photographId);

        if (isInternalError(photographSearchResult)) {
            throw new InternalError(
                `Failed to ADD_PHOTOGRAPH_TO_DIGITAL_TEXT due to invalid existing state`,
                [photographSearchResult]
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.photograph]: isNotFound(photographSearchResult)
                ? []
                : [photographSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        digitalText: DigitalText,
        { pageIdentifier, photographId }: AddPhotographToDigitalTextPage
    ): ResultOrError<DigitalText> {
        return digitalText.addPhotographToPage(pageIdentifier, photographId);
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: AddPhotographToDigitalTextPage,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new PhotographAddedToDigitalTextPage(payload, eventMeta);
    }
}
