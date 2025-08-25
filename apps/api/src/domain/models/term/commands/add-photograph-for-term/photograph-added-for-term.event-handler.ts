import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { PHOTOGRAPH_QUERY_REPOSITORY_TOKEN } from '../../../photograph/queries';
import { ITermQueryRepository } from '../../queries';
import { PhotographAddedForTerm } from './photograph-added-for-term.event';

export class PhotographAddedForTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN) private readonly repository: ITermQueryRepository
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
