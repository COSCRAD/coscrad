import { Inject } from '@nestjs/common';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { ICoscradEventHandler } from '../../../../common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { PromptTermCreated } from './prompt-term-created.event';

export class PromptTermCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository
    ) {}

    async handle(event: PromptTermCreated): Promise<void> {
        await this.termRepository.create(TermViewModel.fromPromptTermCreated(event));
    }
}
