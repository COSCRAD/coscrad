import { isNull } from '@coscrad/validation-constraints';
import { RootState } from '../../..';
import { TERMS } from './constants';

export const selectLoadableTerms = (state: RootState) => {
    const { isLoading, errorInfo, data } = state[TERMS];

    return {
        isLoading,
        errorInfo,
        data: isNull(data)
            ? null
            : {
                  entities: data.selected,
                  indexScopedActions: data.indexScopedActions,
              },
    };
};

export const selectTermById = (state: RootState, id: string) => {
    const { isLoading, errorInfo, data } = state[TERMS];

    const termsById = data?.entities || {};

    return {
        isLoading,
        errorInfo,
        data: id in termsById ? termsById[id] : null,
    };
};
