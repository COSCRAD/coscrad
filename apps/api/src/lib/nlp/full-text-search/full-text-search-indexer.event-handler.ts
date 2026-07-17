import { Inject } from '@nestjs/common';
import { ICoscradEvent, ICoscradEventHandler } from '../../../domain/common';
import { ITokenizerProvider, TOKENIZER_PROVIDER_INJECTION_TOKEN } from '../tokenization';
import {
    FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN,
    IFullTextSearchQueryRepository,
} from './full-text-search-query.interface';

export class FullTextSearchIndexer implements ICoscradEventHandler {
    constructor(
        @Inject(FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN)
        private readonly fullTextSearchQueryRepository: IFullTextSearchQueryRepository,
        @Inject(TOKENIZER_PROVIDER_INJECTION_TOKEN)
        private readonly tokinzerProvider: ITokenizerProvider // // TODO How do we inject this? // private readonly schemaManager: ISchemaManager
    ) {}

    handle(event: ICoscradEvent): Promise<void> {
        const _constructor = Object.getPrototypeOf(event).constructor;

        console.log('foo');

        // TODO why isn't this working? Use DynamicDatatypeFinderService?
        // const _schema = getCoscradDataSchemaFromPrototype(_constructor);

        // TODO Find all ML text valued props
        // TODO then tokenize and index the aggregateCompositeIdentifier against the given text \ letters

        return Promise.resolve();
    }
}
