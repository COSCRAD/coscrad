import { CommandHandler, ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities';
import { AddPhotographToDigitalTextPage } from './add-photograph-to-digital-text-page.command';
import { PhotographAddedToDigitalTextPage } from './photograph-added-to-digital-text-page.event';

@CommandHandler(AddPhotographToDigitalTextPage)
export class AddPhotographToDigitalTextPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
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
