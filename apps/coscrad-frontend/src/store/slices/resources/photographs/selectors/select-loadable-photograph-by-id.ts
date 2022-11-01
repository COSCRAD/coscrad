import {
    IDetailQueryResult,
    IIndexQueryResult,
    IPhotographViewModel,
} from '@coscrad/api-interfaces';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../..';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { IMaybeLoadable, NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';
import { selectLoadablePhotographs } from './select-loadable-photographs';

/**
 * We would like to use this selector to abstract our 'fetchById' from redux out
 * of the component. There were some issues in using this selector in conjunction
 * with our `useLoadable` that must be worked out first.
 */
export const selectLoadablePhotographById = createSelector(
    [
        selectLoadablePhotographs,
        // Forward additional arg
        (state: RootState, idToFind: string) => idToFind,
    ],
    (
        loadablePhotographs: ILoadable<IIndexQueryResult<IPhotographViewModel>>,
        idToFind: string
    ): IMaybeLoadable<IDetailQueryResult<IPhotographViewModel>> => {
        const { isLoading, errorInfo, data: allPhotographs } = loadablePhotographs;

        if (isLoading || errorInfo !== null || allPhotographs === null)
            return {
                isLoading,
                errorInfo,
                data: null,
            };

        const searchResult = allPhotographs.data.find(({ data: { id } }) => id === idToFind);

        if (!searchResult)
            return {
                isLoading,
                errorInfo,
                data: NOT_FOUND,
            };

        return {
            isLoading,
            errorInfo,
            data: searchResult,
        };
    }
);
