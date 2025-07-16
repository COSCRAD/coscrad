import { AggregateType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import {
    ITagQueryRepository,
    TAG_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/tag-query-repository.interface';
import { TagCreated } from './tag-created.event';

@CoscradEventConsumer('TAG_CREATED')
export class TagCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: ITagQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            label,
        },
    }: TagCreated): Promise<void> {
        const newTagView = EventSourcedTagViewModel.fromDto({
            id,
            type: AggregateType.tag,
            label,
            name: buildMultilingualTextWithSingleItem(label),
            members: [],
        });

        await this.queryRepository.create(newTagView);
    }
}
