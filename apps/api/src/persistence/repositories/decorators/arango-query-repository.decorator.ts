import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';

const ARANGO_QUERY_REPOSITORY_META = 'ARANGO_QUERY_REPOSITORY_META';

export type ArangoQueryRepositoryMeta = {
    type: string;
    collectionName: string;
};

type ArangoQueryRepositoryOptions = {
    type: string;
};

export const getArangoQueryRepositoryMeta = (target: Object): Maybe<ArangoQueryRepositoryMeta> => {
    const result = Reflect.getMetadata(ARANGO_QUERY_REPOSITORY_META, target);

    if (!isNonEmptyObject(result)) return NotFound;

    return result as ArangoQueryRepositoryMeta;
};

export function ArangoQueryRepository({ type }: ArangoQueryRepositoryOptions): ClassDecorator {
    return function (target: Object) {
        Reflect.defineMetadata(
            ARANGO_QUERY_REPOSITORY_META,
            {
                type,
                collectionName: `${type}__VIEWS`,
            },
            target
        );
    };
}
