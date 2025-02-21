import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { VocabularyListFilterPropertyRegistered } from './vocabulary-list-filter-property-registered.event';

@CoscradEventConsumer('VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED')
export class VocabularyListFilterPropertyRegisteredEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVocabularyListQueryRepository
    ) {}

    async handle(e: VocabularyListFilterPropertyRegistered): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                name,
                type,
                allowedValuesAndLabels,
            },
        } = e;

        console.log({ handling: JSON.stringify(e) });
        // Has this been done?
        // TODO translate checkbox -> switch
        await this.queryRepository
            .registerFilterProperty(id, name, type, allowedValuesAndLabels)
            .catch((e) => {
                const handlerError = new InternalError(
                    `Failed to register vocabulary list filter property for (${name})[${id}] in Arango query database`,
                    isNonEmptyString(e?.message) ? [new InternalError(e.message)] : []
                );

                throw handlerError;
            });
    }
}
