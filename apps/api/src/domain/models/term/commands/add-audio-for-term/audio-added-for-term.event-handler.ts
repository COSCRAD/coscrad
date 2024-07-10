import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';

export class AudioAddedForTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly repository: ITermQueryRepository
    ) {}

    async handle(): Promise<void> {
        throw new Error(`Not implemented!`);
    }
}
