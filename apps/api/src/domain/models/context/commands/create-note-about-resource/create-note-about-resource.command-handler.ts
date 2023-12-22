import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildAggregateFactory from '../../../../factories/build-aggregate-factory';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../edge-connection.entity';
import { CreateNoteAboutResource } from './create-note-about-resource.command';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';

@CommandHandler(CreateNoteAboutResource)
export class CreateNoteAboutResourceCommandHandler extends BaseCreateCommandHandler<EdgeConnection> {
    protected createNewInstance({
        resourceCompositeIdentifier,
        resourceContext,
        aggregateCompositeIdentifier: { id },
        text,
        languageCode,
    }: CreateNoteAboutResource): ResultOrError<EdgeConnection> {
        const createDto: DTO<EdgeConnection> = {
            type: AggregateType.note,
            id,
            connectionType: EdgeConnectionType.self,
            note: new MultilingualText({
                items: [
                    // Note that translation will require a subsequent command
                    new MultilingualTextItem({
                        text,
                        role: MultilingualTextItemRole.original,
                        languageCode,
                    }),
                ],
            }),
            members: [
                {
                    role: EdgeConnectionMemberRole.self,
                    compositeIdentifier: resourceCompositeIdentifier,
                    context: resourceContext,
                },
            ],
        };

        // TODO wrap this in the base handler and only build create DTO in this method
        return buildAggregateFactory<EdgeConnection>(AggregateType.note)(createDto);
    }

    protected async fetchRequiredExternalState({
        resourceCompositeIdentifier: { type: resourceType, id },
    }: CreateNoteAboutResource): Promise<InMemorySnapshot> {
        const resourceSearchResult = await this.repositoryProvider
            .forResource(resourceType)
            .fetchById(id);

        return new DeluxeInMemoryStore({
            [resourceType]: isNotFound(resourceSearchResult) ? [] : [resourceSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        snapshot: InMemorySnapshot,
        instance: EdgeConnection
    ): InternalError | Valid {
        // Ensure that the resource this note is about exists
        return instance.validateExternalState(snapshot);
    }

    protected buildEvent(
        command: CreateNoteAboutResource,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new NoteAboutResourceCreated(command, eventMeta);
    }
}
