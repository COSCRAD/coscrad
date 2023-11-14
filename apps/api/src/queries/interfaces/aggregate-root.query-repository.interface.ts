import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { Maybe } from '../../lib/types/maybe';

interface HasAggregateCompositeIdentifier {
    type: string;
    id: string;
}

interface BaseAggregateRootViewModel extends HasAggregateCompositeIdentifier {
    isPublished: boolean;
    // TODO Use an interface for the param type here
    hasReadAccess(userWithGroups: CoscradUserWithGroups): boolean;
}

export interface IAggregateRootQueryRepository<T extends BaseAggregateRootViewModel> {
    // TODO Include filters \ specifications
    fetchById(id: string): Promise<Maybe<T>>;

    fetchMany(): Promise<T[]>;
}
