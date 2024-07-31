import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { TermElicitedFromPrompt } from './term.elicited.from.prompt';

@CoscradEventConsumer('TERM_ELICITED_FROM_PROMPT')
export class TermElicitedFromPromptEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: termId },
        },
    }: TermElicitedFromPrompt): Promise<void> {
        // TODO put the role on the event payload
        await this.termRepository.translate(termId, {
            text,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }
}
