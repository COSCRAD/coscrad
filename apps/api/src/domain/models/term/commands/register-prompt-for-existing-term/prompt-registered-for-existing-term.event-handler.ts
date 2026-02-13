import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { PromptRegisteredForExistingTerm } from './prompt-registered-for-existing-term.event';

@CoscradEventConsumer('PROMPT_REGISTERED_FOR_EXISTING_TERM')
export class PromptRegisteredForExistingTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository
    ) {}

    // currently prompts are in english and we do not tokenize engish text
    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: termId },
            text,
            languageCode,
        },
    }: PromptRegisteredForExistingTerm): Promise<void> {
        await this.termRepository.registerPromptForExistingTerm(termId, languageCode, text);
    }
}
