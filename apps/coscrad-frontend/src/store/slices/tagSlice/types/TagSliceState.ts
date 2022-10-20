import { ITag } from '@coscrad/api-interfaces';
import { ILoadable } from '../../interfaces/loadable.interface';

/**
 * Note that we will make a breaking change to the API at somepoint and return
 * an `IIndexQueryResult<ITag>` instead.
 */
export type TagSliceState = ILoadable<ITag[]>;
