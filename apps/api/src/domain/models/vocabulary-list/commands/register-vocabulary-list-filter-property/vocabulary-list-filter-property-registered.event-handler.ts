import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { VocabularyListFilterPropertyRegistered } from './vocabulary-list-filter-property-registered';

@CoscradEventConsumer('VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED')
export class VocabularyListFilterPropertyRegisteredEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVocabularyListQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            name,
            type,
            allowedValuesAndLabels,
        },
    }: VocabularyListFilterPropertyRegistered): Promise<void> {
        // Has this been done?
        // TODO translate checkbox -> switch
        await this.queryRepository.registerFilterProperty(id, name, type, allowedValuesAndLabels);
    }
}
