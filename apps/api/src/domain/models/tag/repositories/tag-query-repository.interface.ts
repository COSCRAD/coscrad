import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { AggregateId } from '../../../types/AggregateId';

export const TAG_QUERY_REPOSITORY_PROVIDER_TOKEN = 'TAG_QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface ITagQueryRepository {
    fetchById(id: AggregateId): Promise<Maybe<EventSourcedTagViewModel>>;

    fetchMany(): Promise<EventSourcedTagViewModel[]>;

    count(): Promise<number>;

    create(tag: EventSourcedTagViewModel): Promise<void>;

    createMany(tags: EventSourcedTagViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    relabel(tagId: string, newLabel: string): Promise<void>;

    tagResourceOrNote<
        TCategorizable extends CategorizableCompositeIdentifier = CategorizableCompositeIdentifier
    >(
        tagId: string,
        categorizableCompositeIdentifier: TCategorizable
    ): Promise<void>;
}
