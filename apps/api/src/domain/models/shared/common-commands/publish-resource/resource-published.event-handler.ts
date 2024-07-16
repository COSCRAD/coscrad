import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ICoscradEvent, ICoscradEventHandler } from '../../../../../domain/common';

export interface IPublishable {
    publish(): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: ResourceType): IPublishable;
}

export class ResourcePublishedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject('QUERY_REPOSITORY_PROVIDER')
        private readonly queryRepositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(_event: ICoscradEvent): Promise<void> {
        throw new Error(`not implemente-d resource published event handler`);
    }
}
