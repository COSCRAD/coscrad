import { isNull } from '@coscrad/validation-constraints';
import { RootState } from '../../..';
import { TERMS } from './constants';

export const selectTermFilter = (state: RootState) => {
    return state[TERMS].filter;
};

export const selectLoadableTerms = (state: RootState) => {
    const { isLoading, errorInfo, data, pageSize, filter } = state[TERMS];

    return {
        isLoading,
        errorInfo,
        pageSize,
        data: isNull(data)
            ? null
            : {
                  ...data,
              },
        filter,
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
