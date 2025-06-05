import { AggregateType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
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
        const {
            payload: {
                aggregateCompositeIdentifier: { id: vocabularyListId },
                name: textForName,
                languageCodeForName,
            },
        } = creationEvent;

        /**
         * TODO We need to determine why using a reference (via new or a static factory method)
         * to the `VocabularyList` class here creates a circular dependency. This isn't
         * a problem for other resource types (e.g., term).
         */
        const listToCreate = {
            type: AggregateType.vocabularyList,
            name: buildMultilingualTextWithSingleItem(textForName, languageCodeForName),
            id: vocabularyListId,
            actions: [
                'ADD_TERM_TO_VOCABULARY_LIST',
                'PUBLISH_RESOURCE',
                'CREATE_NOTE_ABOUT_RESOURCE',
                'CONNECT_RESOURCES_WITH_NOTE',
                'TRANSLATE_VOCABULARY_LIST_NAME',
                'REGISTER_VOCABULARY_LIST_FILTER_PROPERTY',
            ],
            tags: [], // none yet
            contributions: [], // must be joined externally
            isPublished: false,
            accessControlList: new AccessControlList(),
            entries: [], // none yet
        };

        // @ts-expect-error fix me
        await this.queryRepository.create(listToCreate);
    }
}
