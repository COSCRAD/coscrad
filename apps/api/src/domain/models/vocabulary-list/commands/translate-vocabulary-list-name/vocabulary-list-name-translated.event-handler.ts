import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { VocabularyListNameTranslated } from './vocabulary-list-name-translated.event';

@CoscradEventConsumer('VOCABULARY_LIST_NAME_TRANSLATED')
export class VocabularyListNameTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVocabularyListQueryRepository
    ) {}

    async handle({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: vocabularyListId },
        },
    }: VocabularyListNameTranslated): Promise<void> {
        // TODO the role should be part of the payload on a `translationItem` property of type IMultilingualTextItem
        await this.queryRepository.translateName(vocabularyListId, {
            text,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }
}
