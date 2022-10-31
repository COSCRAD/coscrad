import { IBaseViewModel, ICommandFormAndLabels, IIndexQueryResult } from '@coscrad/api-interfaces';

export const buildMockIndexResponse = <T extends IBaseViewModel>(
    viewsAndDetailScopedActions: [T, ICommandFormAndLabels[]][],
    indexScopedActions: ICommandFormAndLabels[]
): IIndexQueryResult<T> => ({
    data: viewsAndDetailScopedActions.reduce(
        (acc, [nextView, nextDetailActions]) =>
            acc.concat({
                data: nextView,
                actions: nextDetailActions,
            }),
        []
    ),
    actions: indexScopedActions,
});
