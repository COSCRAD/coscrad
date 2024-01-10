import { IBaseViewModel } from '@coscrad/api-interfaces';
import { Maybe } from '../../lib/types/maybe';

export interface IAggregateRootQueryRepository<T extends IBaseViewModel> {
    // TODO Include filters \ specifications
    fetchById(id: string): Promise<Maybe<T>>;

    fetchMany(): Promise<T[]>;
}
