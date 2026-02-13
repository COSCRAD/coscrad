import { LanguageCode } from '@coscrad/api-interfaces';
import { Module } from '@nestjs/common';
import { formatLanguageCode } from '../../queries/presentation/formatLanguageCode';
import { InternalError } from '../errors/InternalError';
import { ArangoFullTextSearchQueryRepository } from './full-text-search/arango-full-text-search-query-repository';
import { FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN } from './full-text-search/full-text-search-query.interface';
import { ChilcotinTokenizer, TOKENIZER_PROVIDER_INJECTION_TOKEN } from './tokenization';

/**
 * TODO Make this a separate lib in the monorepo.
 */
@Module({
    providers: [
        {
            provide: TOKENIZER_PROVIDER_INJECTION_TOKEN,
            useValue: {
                has(languageCode: LanguageCode) {
                    return languageCode === LanguageCode.Chilcotin;
                },
                forLanguage(languageCode: LanguageCode) {
                    if (languageCode === LanguageCode.Chilcotin) return new ChilcotinTokenizer();

                    throw new InternalError(
                        `Tokenization is not supported for language: ${formatLanguageCode(
                            languageCode
                        )}. Did you forget to check tokenizerProvider.has(${languageCode})?`
                    );
                },
            },
        },
        {
            provide: FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN,
            useClass: ArangoFullTextSearchQueryRepository,
        },
    ],
    exports: [TOKENIZER_PROVIDER_INJECTION_TOKEN],
})
export class CoscradNLPModule {}
