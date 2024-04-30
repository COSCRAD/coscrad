import { CommandHandler, ICommand } from '@coscrad/commands';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { EdgeConnection } from '../../edge-connection.entity';
import { NoteTranslated } from './note-translated.event';
import { TranslateNote } from './translate-note.command';

@CommandHandler(TranslateNote)
export class TranslateNoteCommandHandler extends BaseUpdateCommandHandler<EdgeConnection> {
    protected actOnInstance(
        instance: EdgeConnection,
        { text, languageCode }: TranslateNote
    ): ResultOrError<EdgeConnection> {
        return instance.translateNote(text, languageCode);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: EdgeConnection
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(
        payload: TranslateNote,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new NoteTranslated(payload, eventMeta);
    }
}
