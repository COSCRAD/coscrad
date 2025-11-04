import { ITermViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { IUserDefinedFilter } from '../thunks';
import { TermIndexState } from './term-index-state';

export type TermSliceState = ILoadable<TermIndexState> & {
    pageSize: number;
    filter?: IUserDefinedFilter<ITermViewModel>;
};
