import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildAggregateFactory from '../../../../factories/buildAggregateFactory';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../edge-connection.entity';
import { CreateNoteAboutResource } from './create-note-about-resource.command';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';

@CommandHandler(CreateNoteAboutResource)
export class CreateNoteAboutResourceCommandHandler extends BaseCreateCommandHandler<EdgeConnection> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<EdgeConnection>;

    protected aggregateType: AggregateType = AggregateType.note;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate =
            this.repositoryProvider.getEdgeConnectionRepository();
    }

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
        eventId: string,
        userId: string
    ): BaseEvent {
        return new NoteAboutResourceCreated(command, eventId, userId);
    }
}
