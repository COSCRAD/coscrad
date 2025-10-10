import {
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    ITermViewModel,
} from '@coscrad/api-interfaces';

export type TermIndexState = {
    indexScopedActions: IBackendCommandFormAndLabels[];
    entities: Map<string, ITermViewModel>;
};
