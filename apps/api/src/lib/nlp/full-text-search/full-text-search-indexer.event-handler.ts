import { Inject } from '@nestjs/common';
import { ConsoleCoscradCliLogger, ICoscradLogger } from '../../../coscrad-cli/logging';
import { ICoscradEvent, ICoscradEventHandler } from '../../../domain/common';
import { MultilingualTextItem } from '../../../domain/common/entities/multilingual-text';
import { getMultilingualTextFields } from '../multilingual-text';
import { ITokenizerProvider, TOKENIZER_PROVIDER_INJECTION_TOKEN } from '../tokenization';
import {
    FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN,
    IFullTextSearchQueryRepository,
} from './full-text-search-query.interface';

export class FullTextSearchIndexer implements ICoscradEventHandler {
    private readonly logger: ICoscradLogger = new ConsoleCoscradCliLogger();

    constructor(
        @Inject(FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN)
        private readonly fullTextSearchQueryRepository: IFullTextSearchQueryRepository,
        @Inject(TOKENIZER_PROVIDER_INJECTION_TOKEN)
        private readonly tokinzerProvider: ITokenizerProvider // // TODO How do we inject this? // private readonly schemaManager: ISchemaManager
    ) {}

    async handle(
        event: ICoscradEvent & {
            payload: { aggregateCompositeIdentifier: { type: string; id: string } };
        }
    ): Promise<void> {
        const constructor = Object.getPrototypeOf(event.payload).constructor;

        const fieldsToIndex = getMultilingualTextFields(constructor);

        fieldsToIndex.forEach(async (fieldPath) => {
            const value = event.payload[fieldPath] as MultilingualTextItem;

            if (!this.tokinzerProvider.has(value.languageCode)) {
                // we don't have a tokenizer for the language of this text
                return;
            }

            const tokens = this.tokinzerProvider
                .forLanguage(value.languageCode)
                .tokenize(value.text);

            await this.fullTextSearchQueryRepository
                .index(tokens, event.payload.aggregateCompositeIdentifier)
                .catch((e) => {
                    console.log(':(');

                    this.logger.log(
                        `Failed to tokenize text for event of type [${event.type}].\n ${e}`
                    );
                });
        });

        console.log('hi');
    }
}
