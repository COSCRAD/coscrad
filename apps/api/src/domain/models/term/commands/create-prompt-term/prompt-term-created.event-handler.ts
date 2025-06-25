import { Inject } from '@nestjs/common';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { parseTermRawData } from '../utils/parse-term-raw-data';
import { PromptTermCreated } from './prompt-term-created.event';

@CoscradEventConsumer('PROMPT_TERM_CREATED')
export class PromptTermCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository
    ) {}

    async handle(event: PromptTermCreated): Promise<void> {
        /**
         * `rawData` conventions
         * possibleAudioFilenames: `string[]`
         * audioFilename: `string`
         */
        const {
            payload: { rawData },
        } = event;

        const termLineageInfo = parseTermRawData(rawData);

        const term = TermViewModel.fromPromptTermCreated(event);

        if (!isInternalError(termLineageInfo)) {
            const { possibleAudioFilenames } = termLineageInfo;

            if (possibleAudioFilenames?.length > 0) {
                term.possibleAudioFilenames = possibleAudioFilenames;
            }
        }

        await this.termRepository.create(term);
    }
}
