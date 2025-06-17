import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../types/AggregateId';

import { IResourceQueryRepository } from '../../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { ITranscriptQueryRepository } from '../../shared/queries/transcript-query-repository.interface';
import { EventSourcedVideoViewModel } from './video.view-model.event-sourced';

export const VIDEO_QUERY_REPOSITORY_TOKEN = 'VIDEO_QUERY_REPOSITORY_TOKEN';

export interface IVideoQueryRepository
    extends IResourceQueryRepository<EventSourcedVideoViewModel>,
        ITranscriptQueryRepository {
    delete(id: AggregateId): Promise<void>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;
}
