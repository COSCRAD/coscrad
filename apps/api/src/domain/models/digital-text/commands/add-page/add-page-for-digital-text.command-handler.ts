import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { DigitalText } from '../../entities/digital-text.entity';
import { AddPageForDigitalText } from './add-page-for-digital-text.command';
import { PageAddedForDigitalText } from './page-added-for-digital-text.event';

@CommandHandler(AddPageForDigitalText)
export class AddPageForDigitalTextCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
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
        { identifier: pageIdentifier }: AddPageForDigitalText
    ): ResultOrError<DigitalText> {
        return digitalText.addPage(pageIdentifier);
    }

    protected buildEvent(
        command: AddPageForDigitalText,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new PageAddedForDigitalText(command, eventId, userId);
    }
}
