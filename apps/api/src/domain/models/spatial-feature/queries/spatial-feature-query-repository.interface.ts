import { LanguageCode, PaginatedResponse } from '@coscrad/api-interfaces';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { Maybe } from '../../../../lib/types/maybe';
import { SpatialFeatureViewModel } from '../../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { IQueryRepositoryForConnectable } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForAttributable } from '../../shared/common-event-handlers/attributor.event-handler';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/tag-added-for-resource.event-handler';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { EventSourcedSpatialFeatureViewModel } from './spatial-feature.view-model.event-sourced';

export const SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN = 'SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN';

export interface ISpatialFeatureQueryRepository
    extends IQueryRepositoryForAnnotatable,
        IQueryRepositoryForConnectable,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAttributable,
        IAccessible,
        IPublishable {
    create(view: SpatialFeatureViewModel): Promise<void>;

    createMany(views: SpatialFeatureViewModel[]): Promise<void>;

    fetchById(
        id: string,
        user?: CoscradUserWithGroups
    ): Promise<Maybe<EventSourcedSpatialFeatureViewModel>>;

    fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<EventSourcedSpatialFeatureViewModel>>;

    count(options?: FetchManyQueryOptions): Promise<number>;

    translateSpatialFeatureName(
        id: string,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void>;

    addAlternativeName(
        id: string,
        label: string,
        text: string,
        languageCode: LanguageCode
    ): Promise<void>;
}
