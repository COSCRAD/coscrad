import { AsyncThunk } from '@reduxjs/toolkit';
import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';

export interface LoadableIndexContainerProps<TIndexState> {
    selector: (state: RootState) => ILoadable<TIndexState>;
    IndexPresenter: FC<TIndexState>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    fetchThunk: AsyncThunk<TIndexState, void, {}>;
}

export const LoadableIndexContainer = <TIndexState,>({
    selector,
    fetchThunk,
    IndexPresenter,
}: LoadableIndexContainerProps<TIndexState>): JSX.Element => {
    const { data, isLoading, errorInfo } = useSelector(selector);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data === null) dispatch(fetchThunk());
    }, [data, dispatch, fetchThunk]);

    if (errorInfo) return <ErrorDisplay {...errorInfo}></ErrorDisplay>;

    if (isLoading || data === null) return <Loading></Loading>;

    return <IndexPresenter {...data} />;
};
