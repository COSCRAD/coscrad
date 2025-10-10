import {
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    ITermViewModel,
} from '@coscrad/api-interfaces';

export type TermIndexState = {
    indexScopedActions: IBackendCommandFormAndLabels[];
    /**
     * Note that a `Map` does not play nice with serialization required for
     * some of the React dev tools.
     */
    entities: Record<string, ITermViewModel>;
};
