import { CommandHandler, ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { DigitalText } from '../../entities';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

@CommandHandler(AddAudioForDigitalTextPage)
export class AddAudioForDigitalTextPageCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected actOnInstance(
        digitalText: DigitalText,
        { audioItemId, pageIdentifier, languageCode }: AddAudioForDigitalTextPage
    ): ResultOrError<DigitalText> {
        const updatedInstance = digitalText.addAudioForPage(
            audioItemId,
            pageIdentifier,
            languageCode
        );

        return updatedInstance;
    }

    protected fetchRequiredExternalState(_: ICommand): Promise<InMemorySnapshot> {
        return;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddAudioForDigitalTextPage,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new AudioAddedForDigitalTextPage(command, eventMeta);
    }
}
