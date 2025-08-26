import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { PhotographAddedForTerm } from './photograph-added-for-term.event';

export class PhotographAddedForTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly repository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: termId },
            photographId,
        },
    }: PhotographAddedForTerm): Promise<void> {
        await this.repository.addPhotograph(termId, photographId);
    }
}
