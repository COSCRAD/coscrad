import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../../lib/types/maybe';
import { AggregateId } from '../../../../types/AggregateId';
import { IAccessible } from '../../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ITranscriptQueryRepository } from '../../shared/queries/transcript-query-repository.interface';
import {
    ICountable,
    IPublishable,
} from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForTaggable } from '../../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';
import { EventSourcedVideoViewModel } from './video-view-model.event-sourced';

export const VIDEO_QUERY_REPOSITORY_TOKEN = 'VIDEO_QUERY_REPOSITORY_TOKEN';

export interface IVideoQueryRepository
    extends IPublishable,
        IAccessible,
        ITranscriptQueryRepository {
        ICountable,
        // only substantial change on this branch - just opt in to this when rebasing
        IQueryRepositoryForTaggable {
    create(view: EventSourcedVideoViewModel): Promise<void>;

    createMany(view: EventSourcedVideoViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<EventSourcedVideoViewModel>>;

    fetchMany(): Promise<EventSourcedVideoViewModel[]>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;
}
