import { IBaseViewModel, ICommandFormAndLabels, IIndexQueryResult } from '@coscrad/api-interfaces';

export const buildMockIndexResponse = <T extends IBaseViewModel>(
    viewsAndDetailScopedActions: [T, ICommandFormAndLabels[]][],
    indexScopedActions: ICommandFormAndLabels[]
): IIndexQueryResult<T> => ({
    entities: viewsAndDetailScopedActions.reduce(
        (acc, [nextView, nextDetailActions]) =>
            acc.concat({
                ...nextView,
                actions: nextDetailActions,
            }),
        []
    ),
    indexScopedActions: indexScopedActions,
});
