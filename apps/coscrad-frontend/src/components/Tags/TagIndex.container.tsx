import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchTags } from '../../store/slices/tagSlice/thunks';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { TagIndexPresenter } from './TagIndex.presenter';

export const TagIndexContainer = (): JSX.Element => {
    const tagsData = useSelector((state: RootState) => state.tags.data);

    const isLoading = useSelector((state: RootState) => state.tags.isLoading);

    const errorInfo = useSelector((state: RootState) => state.tags.errorInfo);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (tagsData === null) {
            dispatch(fetchTags());
        }
    }, [tagsData, dispatch]);

    if (errorInfo) return <ErrorDisplay {...errorInfo}></ErrorDisplay>;

    if (isLoading || tagsData === null) return <Loading></Loading>;

    return <TagIndexPresenter tags={tagsData}></TagIndexPresenter>;
};
