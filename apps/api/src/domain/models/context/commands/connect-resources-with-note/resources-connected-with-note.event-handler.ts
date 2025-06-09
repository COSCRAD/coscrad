import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DTO } from '../../../../../types/DTO';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { EdgeConnectionContext } from '../../context.entity';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';

export interface INoteConnectedDto {
    noteId: AggregateId;
    context: DTO<EdgeConnectionContext>;
}

export interface IQueryRepositoryForConnection {
    connectResourcesWith(id: string, dto: INoteConnectedDto): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForConnection;
}

@CoscradEventConsumer('RESOURCES_CONNECTED_WITH_NOTE')
export class ResourcesConnectedWithNoteEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(_event: ResourcesConnectedWithNote): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
