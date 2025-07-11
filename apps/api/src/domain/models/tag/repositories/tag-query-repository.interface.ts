import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { AggregateId } from '../../../types/AggregateId';

export const TAG_QUERY_REPOSITORY_PROVIDER_TOKEN = 'TAG_QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface ITagQueryRepository {
    fetchById(id: AggregateId): Promise<Maybe<EventSourcedTagRecordForResourceViewModel>>;

    fetchMany(): Promise<EventSourcedTagRecordForResourceViewModel[]>;

    count(): Promise<number>;

    create(tag: EventSourcedTagRecordForResourceViewModel): Promise<void>;

    createMany(tags: EventSourcedTagRecordForResourceViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    relabel(tagId: string, newLabel: string): Promise<void>;

    tagResourceOrNote(
        tagId: string,
        categorizableCompositeIdentifier: CategorizableCompositeIdentifier
    ): Promise<void>;
}
