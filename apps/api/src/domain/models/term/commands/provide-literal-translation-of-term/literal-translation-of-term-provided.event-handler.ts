import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { LiteralTranslationOfTermProvided } from './literal-translation-of-term-provided.event';

@CoscradEventConsumer('LITERAL_TRANSLATION_OF_TERM_PROVIDED')
export class LiteralTranslationOfTermProvidedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly queryRepository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: termId },
            translationItem,
        },
    }: LiteralTranslationOfTermProvided): Promise<void> {
        await this.queryRepository.translate(termId, translationItem);
    }
}
