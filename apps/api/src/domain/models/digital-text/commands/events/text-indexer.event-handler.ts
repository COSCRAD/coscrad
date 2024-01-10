import { CoscradComplexDataType, LanguageCode } from '@coscrad/api-interfaces';
import { getCoscradDataSchema } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../shared/events/base-event.entity';

export type CoscradIndex = {
    languageCode: LanguageCode;
    token: string;
    viewCompositeIdentifiers: {
        type: string;
        id: string;
    }[];
};

export interface ITextIndexer {
    index(...indexes: CoscradIndex[]): Promise<void>;
}

export interface ITokenizer {
    tokenize(longText: string): string[];
}

const isMultilingualTextItemSchema = (schema): boolean => {
    const actualSchema = getCoscradDataSchema(MultilingualTextItem);

    return isDeepStrictEqual(schema, actualSchema);
};

// Ideally, we wouldn't need to register these manually
@EventHandler(`DIGITAL_TEXT_CREATED`)
export class TextIndexingEventConsumer implements ICoscradEventHandler {
    constructor(
        @Inject(`TEXT_INDEXER_TOKEN`) private readonly textIndexer: ITextIndexer,

        @Inject(`TOKENIZER_INJECTION_TOKEN`) private readonly tokenizer: ITokenizer
    ) {}

    async handle(event: BaseEvent): Promise<void> {
        const eventCtor = Object.getPrototypeOf(event).constructor;

        const payloadSchema = getCoscradDataSchema(eventCtor)['payload']['schema'];

        if (!isNonEmptyObject(payloadSchema)) {
            throw new InternalError(
                `Failed to find data schema for payload on event of type: ${event.type}`
            );
        }

        if (!payloadSchema) return;

        const indexes = Object.entries(payloadSchema).flatMap(([propertyKey, propertySchema]) => {
            const { complexDataType } = propertySchema as unknown as any;

            if (complexDataType === CoscradComplexDataType.nested) {
                if (isMultilingualTextItemSchema(propertySchema.schema)) {
                    const multilingualTextValue = event.payload[
                        propertyKey
                    ] as MultilingualTextItem;

                    // what about the role?
                    const { text, languageCode } = multilingualTextValue;

                    return this.tokenizer.tokenize(text).map((token) => ({
                        languageCode,
                        token,
                        viewCompositeIdentifiers: [event.getPayload().aggregateCompositeIdentifier],
                    }));
                }
            }

            return [];
        });

        await this.textIndexer.index(...indexes);
    }
}
