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
import { DigitalTextTitleTranslated } from './digital-text-title-translated.event';
import { TranslateDigitalTextTitle } from './translate-digital-text-title.command';

@CommandHandler(TranslateDigitalTextTitle)
export class TranslateDigitalTextTitleCommandHandler extends BaseUpdateCommandHandler<DigitalText> {
    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: DigitalText
    ): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(
        _instance: DigitalText,
        _command: ICommand
    ): ResultOrError<DigitalText> {
        throw new InternalError('not implemented');
    }

    protected buildEvent(
        command: TranslateDigitalTextTitle,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new DigitalTextTitleTranslated(command, eventMeta);
    }
}
