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
        private readonly tokinzerProvider: ITokenizerProvider
    ) {}

    handle(_event: ICoscradEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
