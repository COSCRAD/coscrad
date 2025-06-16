import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ContributionSummary } from '../../../user-management';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../publish-resource/resource-published.event-handler';
import { AdditionalCreditsProvidedForResource } from './additional-credits-provided-for-resource.event';

export interface IQueryRepositoryForAttributable {
    attribute(id: string, contributionSummary: ContributionSummary): Promise<void>;
}

interface IRepositoryProvider {
    forResource(type: string): IQueryRepositoryForAttributable;
}

@CoscradEventConsumer('AdditionalCreditsProvidedForResource')
export class AdditionalCreditsProvidedForResourceEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly provider: IRepositoryProvider
    ) {}

    async handle(_event: AdditionalCreditsProvidedForResource): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
