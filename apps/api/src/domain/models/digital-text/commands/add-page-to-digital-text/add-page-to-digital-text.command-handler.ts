import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities/digital-text.entity';
import { PageAddedToDigitalText } from '../events/page-added-to-digital-text.event';
import { AddPageToDigitalText } from './add-page-to-digital-text.command';

@CommandHandler(AddPageToDigitalText)
export class AddPageToDigitalTextCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        digitalText: DigitalText,
        { identifier: pageIdentifier }: AddPageToDigitalText
    ): ResultOrError<DigitalText> {
        return digitalText.addPage(pageIdentifier);
    }

    protected buildEvent(command: AddPageToDigitalText, eventMeta: EventRecordMetadata): BaseEvent {
        return new PageAddedToDigitalText(command, eventMeta);
    }
}
