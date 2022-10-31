import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';

export type TermSliceState = ILoadable<IIndexQueryResult<ITermViewModel>>;
