import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';

export type PhotographSliceState = ILoadable<IIndexQueryResult<IPhotographViewModel>>;
