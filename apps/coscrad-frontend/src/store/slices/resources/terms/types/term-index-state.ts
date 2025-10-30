import {
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';

export type TermIndexState = {
    indexScopedActions: IBackendCommandFormAndLabels[];
    /**
     * Note that a `Map` does not play nice with serialization required for
     * some of the React dev tools.
     *
     * This cache is only used for `byId` searches for,e.g., detail views.
     */
    entities: Record<string, ITermViewModel | NOT_FOUND>;
    /**
     * For performance, we have moved to an active search strategy. Index views
     * use an active search strategy. A paginated and filtered response from the
     * back-end is
     * 1. stored in the `entities` cache for detail views.
     * 2. Populates a fresh selection in the following property
     */
    selected: ITermViewModel[];
    page: number;
};
