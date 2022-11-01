import { AsyncThunk } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';

interface UseLoadableArgs<TSelectedState, UIndexState> {
    selector: (state: RootState) => ILoadable<TSelectedState>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    fetchThunk: AsyncThunk<UIndexState, void, {}>;
}

export const useLoadable = <TSelectedState, UIndexState>({
    selector,
    fetchThunk,
}: UseLoadableArgs<TSelectedState, UIndexState>): [ILoadable<TSelectedState>] => {
    const loadable = useSelector(selector);

    const { data } = loadable;

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data === null) dispatch(fetchThunk());
    }, [data, dispatch, fetchThunk]);

    return [loadable];
};
