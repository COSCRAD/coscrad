import { LanguageCode } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { ITokenizer } from '../../tokenization';
import { TermCreated } from './term-created.event';

interface ITokenizerProvider {
    has(langaugeCode: LanguageCode): boolean;

    forLanguage(languageCode: LanguageCode): ITokenizer;
}

@CoscradEventConsumer('TERM_CREATED')
export class TermCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository,
        @Inject('TOKENIZER_PROVIDER') private readonly tokenizerProvider: ITokenizerProvider
    ) {}

    async handle(event: TermCreated): Promise<void> {
        const term = TermViewModel.fromTermCreated(event);

        const {
            payload: { languageCode, text },
        } = event;

        term.tokens = this.tokenizerProvider.has(languageCode)
            ? this.tokenizerProvider.forLanguage(languageCode).tokenize(text)
            : // TODO log tokenization not supported for this language
              [];

        await this.termRepository.create(term);
    }
}
