import { AggregateType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../../photograph/queries';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../../term/queries';
import { ResourceReadAccessGrantedToUser } from './resource-read-access-granted-to-user.event';

export class ResourceReadAccessGrantedToUserEventHandler implements ICoscradEventHandler {
    constructor(
        // TODO make this a generic repository provider for all resource views
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository,
        @Inject(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN)
        private readonly photographRepository: IPhotographQueryRepository
    ) {}

    async handle(event: ResourceReadAccessGrantedToUser): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id, type: resourceType },
                userId,
            },
        } = event;

        if (resourceType !== AggregateType.term && resourceType !== AggregateType.photograph) {
            // TODO support all resource types
            return;
        }

        await this.termRepository.allowUser(id, userId);
    }
}
