import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';

export type TermSliceState = ILoadable<IIndexQueryResult<IBaseViewModel>>;
