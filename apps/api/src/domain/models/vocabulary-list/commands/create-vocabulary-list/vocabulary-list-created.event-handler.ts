import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { VocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { VocabularyListCreated } from './vocabulary-list-created.event';

@CoscradEventConsumer('VOCABULARY_LIST_CREATED')
export class VocabularyListCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVocabularyListQueryRepository
    ) {}

    async handle(creationEvent: VocabularyListCreated): Promise<void> {
        const listToCreate = VocabularyListViewModel.fromVocabularyListCreated(creationEvent);

        await this.queryRepository.create(listToCreate);

        // todo make this atomic
        if (creationEvent.meta.contributorIds?.length > 0) {
            await this.queryRepository.attribute(
                listToCreate.id,
                creationEvent.meta.contributorIds
                // TODO include an attribution here?
                // `Created by {}`
            );
        }
    }
}
