import { isFunction } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../common';
import { ContributionSummary } from '../../user-management';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../common-commands/publish-resource/resource-published.event-handler';
import { BaseEvent } from '../events/base-event.entity';

export interface IQueryRepositoryForAttributable {
    attribute(id: string, contributionSummary: ContributionSummary): Promise<void>;
}

interface IRepositoryProvider {
    forResource(type: string): IQueryRepositoryForAttributable;
}

// handles all events
@CoscradEventConsumer(() => true)
export class Attributor implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN) private readonly provider: IRepositoryProvider
    ) {}

    async handle(event: BaseEvent): Promise<void> {
        const repo = this.provider.forResource(event.payload.aggregateCompositeIdentifier.type);

        if (!isFunction(repo?.attribute)) {
            console.log(
                `failed to attribute for: ${event.payload.aggregateCompositeIdentifier.type}`
            );

            return;

            // TODO log failure? We will hit this for resource types that don't have a query repo registered yet.
        }

        await repo.attribute(
            event.payload.aggregateCompositeIdentifier.id,
            event.buildContributionSummary()
        );
    }
}
