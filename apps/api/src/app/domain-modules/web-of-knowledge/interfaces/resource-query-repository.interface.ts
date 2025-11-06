import { IQueryRepositoryForConnectable } from '../../../../domain/models/context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { IQueryRepositoryForAnnotatable } from '../../../../domain/models/context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../../../domain/models/shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForAttributable } from '../../../../domain/models/shared/common-event-handlers/attributor.event-handler';
import { IQueryRepositoryForTaggable } from '../../../../domain/models/tag/commands/tag-resource-or-note/tag-added-for-resource.event-handler';
import { CoscradUserWithGroups } from '../../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { Maybe } from '../../../../lib/types/maybe';
import { UserQueryOptions } from '../../../controllers/resources/term.controller';

export type FetchManyQueryOptions = Partial<UserQueryOptions> & {
    user?: CoscradUserWithGroups;
};

export interface IResourceQueryRepository<T = unknown>
    extends ICountable,
        IPublishable,
        IQueryRepositoryForAnnotatable,
        IQueryRepositoryForConnectable,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAttributable,
        IAccessible {
    create(view: T): Promise<void>;
    createMany(views: T[]): Promise<void>;
    fetchById(id: string): Promise<Maybe<T>>;
    fetchMany(options?: FetchManyQueryOptions): Promise<T[]>;
}
