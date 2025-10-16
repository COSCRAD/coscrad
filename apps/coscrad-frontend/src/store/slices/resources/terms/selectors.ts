import { RootState } from '../../..';
import { TERMS } from './constants';

export const selectLoadableTerms = (state: RootState) => state[TERMS];

export const selectTermById = (state: RootState, id: string) => {
    const { isLoading, errorInfo, data } = state[TERMS];

    const termsById = data?.entities || {};

    return {
        isLoading,
        errorInfo,
        data: id in termsById ? termsById[id] : null,
    };
};
