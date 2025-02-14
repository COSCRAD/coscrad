import { Inject } from '@nestjs/common';
import { PhotographViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/photograph.view-model';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import { IPhotographQueryRepository, PHOTOGRAPH_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { PhotographCreated } from './photograph-created.event';

@CoscradEventConsumer('PHOTOGRAPH_CREATED')
export class PhotographCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN)
        private readonly photographRepository: IPhotographQueryRepository
    ) {}

    async handle(event: PhotographCreated): Promise<void> {
        const { meta: { contributorIds = [] } = { contributorIds: [] } } = event;

        const photograph = PhotographViewModel.fromPhotographCreated(event);

        await this.photographRepository.create(photograph);

        await this.photographRepository.attribute(photograph.id, contributorIds);
    }
}
