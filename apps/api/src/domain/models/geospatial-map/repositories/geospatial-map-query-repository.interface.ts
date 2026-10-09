import { IMultilingualTextItem, PaginatedResponse } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { IQueryRepositoryForConnectable } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForAttributable } from '../../shared/common-event-handlers/attributor.event-handler';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/tag-added-for-resource.event-handler';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { GeospatialMapViewModel } from '../queries/geospatial-map.view-model';

export const GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN = 'GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN';

export interface IGeospatialMapQueryRepository
    extends IQueryRepositoryForAnnotatable,
        IQueryRepositoryForConnectable,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAttributable,
        IAccessible,
        IPublishable {
    create(view: GeospatialMapViewModel): Promise<void>;

    createMany(views: GeospatialMapViewModel[]): Promise<void>;

    fetchById(id: string, user?: CoscradUserWithGroups): Promise<Maybe<GeospatialMapViewModel>>;

    fetchMany(options?: FetchManyQueryOptions): Promise<PaginatedResponse<GeospatialMapViewModel>>;

    count(options?: FetchManyQueryOptions): Promise<number>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    addSpatialFeature(id: AggregateId, spatialFeatureId: AggregateId): Promise<void>;

    subscribleToUpdates(): Observable<{ data: { type: string } }>;

    delete(id: string): Promise<void>;
}
