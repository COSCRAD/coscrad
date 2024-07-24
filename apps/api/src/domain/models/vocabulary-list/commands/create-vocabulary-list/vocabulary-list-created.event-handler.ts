import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { EventSourcedVocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { VocabularyListCreated } from './vocabulary-list-created.event';

export class VocabularyListCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVocabularyListQueryRepository
    ) {}

    async handle(creationEvent: VocabularyListCreated): Promise<void> {
        return this.queryRepository.create(
            EventSourcedVocabularyListViewModel.fromVocabularyListCreated(creationEvent)
        );
    }
}
