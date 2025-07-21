import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    ITagQueryRepository,
    TAG_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/tag-query-repository.interface';
import { TagRelabelled } from './tag-relabelled.event';

export class TagRelabelledEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: ITagQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            newLabel,
        },
    }: TagRelabelled): Promise<void> {
        await this.queryRepository.relabel(id, newLabel);
    }
}
