import { isNull } from '@coscrad/validation-constraints';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../..';
import { NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { selectLoadableDigitalTexts } from '../../digital-texts/selectors';
import { DIGITAL_TEXT_PAGES } from '../constants';

export const fetchDigitalTextPages = createAsyncThunk(
    buildResourceFetchActionPrefix(DIGITAL_TEXT_PAGES),
    async (digitalTextId: string, thunkAPI) => {
        const { getState } = thunkAPI;

        const digitalTexts = selectLoadableDigitalTexts(getState() as RootState);

        const { data: allItems, isLoading, errorInfo } = digitalTexts;

        if (isLoading || !isNull(errorInfo) || isNull(allItems))
            return {
                isLoading,
                errorInfo,
                data: null,
            };

        const searchResult = allItems.entities.find(({ id }) => id === digitalTextId) || NOT_FOUND;

        if (searchResult !== NOT_FOUND) {
            const { pages } = searchResult;

            return pages;
        }

        return NOT_FOUND;
    }
);
