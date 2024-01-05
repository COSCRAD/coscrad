import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../../queries/interfaces/aggregate-root-query-repository-provider.interface';
import { ResourceReadAccessGrantedToUser } from './resource-read-access-granted-to-user.event';

@EventHandler(`RESOURCE_READ_ACCESS_GRANTED_TO_USER`)
export class ResourceReadAccessGrantedToUserEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(event: ResourceReadAccessGrantedToUser): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { type: resourceType, id },
                userId,
            },
        } = event;

        const existingResource = await this.repositoryProvider
            .forResource(resourceType)
            .fetchById(id);

        if (isNotFound(existingResource)) return;

        // TODO remove this
        const { queryAccessControlList } = existingResource as DigitalTextViewModel;

        const updatedAcl = queryAccessControlList.allowUser(userId);

        await this.repositoryProvider.forResource(resourceType).update({
            id,
            // @ts-expect-error Update the base type now
            queryAccessControlList: updatedAcl,
        });
    }
}
