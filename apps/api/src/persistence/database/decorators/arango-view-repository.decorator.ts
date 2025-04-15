import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';

export const ARANGO_VIEW_REPOSITORY_METADATA = 'ARANGO_VIEW_REPOSITORY_METADATA';

export interface ArangoViewRepositoryMetadata {
    viewType: string;
    ctor: unknown;
}

export const getArangoViewRepositoryMetadata = (
    ctor: Object
): Maybe<ArangoViewRepositoryMetadata> => {
    const searchResult = Reflect.getMetadata(ARANGO_VIEW_REPOSITORY_METADATA, ctor);

    if (!isNonEmptyObject(searchResult)) return NotFound;

    /**
     * The associated decorator is the only one who writes to this metadata.
     */
    return searchResult as ArangoViewRepositoryMetadata;
};

export const hasArangoViewRepositoryMetatdata = (ctor: Object): boolean =>
    !isNotFound(getArangoViewRepositoryMetadata(ctor));

export function ArangoViewRepository(viewType: string): ClassDecorator {
    return function (target: Object) {
        // ensure that this decorator is idempotent
        if (hasArangoViewRepositoryMetatdata(target)) {
            return;
        }

        const meta: ArangoViewRepositoryMetadata = {
            viewType,
            ctor: target,
        };

        Reflect.defineMetadata(ARANGO_VIEW_REPOSITORY_METADATA, meta, target);
    };
}
