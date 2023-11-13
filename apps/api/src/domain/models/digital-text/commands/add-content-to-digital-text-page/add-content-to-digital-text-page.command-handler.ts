import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { DigitalText } from '../../entities';
import { AddContentToDigitalTextPage } from './add-content-to-digital-text-page.command';
import { ContentAddedToDigitalTextPage } from './content-added-to-digital-text-page.event';

@CommandHandler(AddContentToDigitalTextPage)
export class AddContentToDigitalTextPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        digitalText: DigitalText,
        { pageIdentifier, text, languageCode }: AddContentToDigitalTextPage
    ): ResultOrError<DigitalText> {
        const updatedInstance = digitalText.addContentToPage(pageIdentifier, text, languageCode);

        updatedInstance;

        return updatedInstance;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddContentToDigitalTextPage,
        eventId: string,
        userId: string
    ): BaseEvent<ICommandBase> {
        return new ContentAddedToDigitalTextPage(command, eventId, userId);
    }
}
