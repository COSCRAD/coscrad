import { LanguageCode } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    ITokenizer,
    TOKENIZER_PROVIDER_INJECTION_TOKEN,
} from '../../../../../lib/nlp/tokenization';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { TermElicitedFromPrompt } from './term-elicited.from.prompt';

// TODO share this with other handlers
interface ITokenizerProvider {
    has(langaugeCode: LanguageCode): boolean;

    forLanguage(languageCode: LanguageCode): ITokenizer;
}

@CoscradEventConsumer('TERM_ELICITED_FROM_PROMPT')
export class TermElicitedFromPromptEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository,
        @Inject(TOKENIZER_PROVIDER_INJECTION_TOKEN)
        private readonly tokenizerProvider: ITokenizerProvider
    ) {}

    async handle({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: termId },
        },
    }: TermElicitedFromPrompt): Promise<void> {
        const tokens = this.tokenizerProvider.has(languageCode)
            ? this.tokenizerProvider.forLanguage(languageCode).tokenize(text)
            : [];

        // TODO put the role on the event payload
        await this.termRepository.elicitFromPrompt(
            termId,
            {
                text,
                languageCode,
            },
            tokens
        );
    }
}
