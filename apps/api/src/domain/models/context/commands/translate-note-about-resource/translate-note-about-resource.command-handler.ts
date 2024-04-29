import {
    AggregateType,
    EdgeConnectionType,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import buildAggregateFactory from '../../../../../domain/factories/build-aggregate-factory';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { EdgeConnection } from '../../edge-connection.entity';
import { NoteTranslatedAboutResource } from './note-translated-about-resource.event';
import { TranslateNoteAboutResource } from './translate-note-about-resource.command';

@CommandHandler(TranslateNoteAboutResource)
export class TranslateNoteAboutResourceCommandHandler extends BaseCreateCommandHandler<EdgeConnection> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        text,
        languageCode,
    }: TranslateNoteAboutResource): ResultOrError<EdgeConnection> {
        const createDto: DTO<EdgeConnection> = {
            type: AggregateType.note,
            id,
            connectionType: EdgeConnectionType.dual,
            note: new MultilingualText({
                items: [
                    {
                        text,
                        languageCode,
                        role: MultilingualTextItemRole.freeTranslation,
                    },
                ],
            }),
            members: [],
        };

        return buildAggregateFactory<EdgeConnection>(AggregateType.note)(createDto);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: EdgeConnection
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(
        payload: TranslateNoteAboutResource,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new NoteTranslatedAboutResource(payload, eventMeta);
    }
}
