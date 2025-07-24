import { Inject } from '@nestjs/common';
import {
    CoscradEventConsumer,
    ICoscradEvent,
    ICoscradEventHandler,
} from '../../../../../domain/common';
import {
    ITagQueryRepository,
    TAG_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/tag-query-repository.interface';

@CoscradEventConsumer('RESOURCE_OR_NOTE_TAGGED')
export class ResourceAddedToTagEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repository: ITagQueryRepository
    ) {}

    async handle(_event: ICoscradEvent): Promise<void> {
        // this.repository.tagResourceOrNote();
        throw new Error('not implemented');
    }
}
