import { AsyncThunk } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';

interface UseLoadableArgs<TIndexState> {
    selector: (state: RootState) => ILoadable<TIndexState>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    fetchThunk: AsyncThunk<TIndexState, void, {}>;
}

export const useLoadable = <TIndexState>({
    selector,
    fetchThunk,
}: UseLoadableArgs<TIndexState>) => {
    const loadable = useSelector(selector);

    const { data } = loadable;

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data === null) dispatch(fetchThunk());
    }, [data, dispatch, fetchThunk]);

    return [loadable];
};
