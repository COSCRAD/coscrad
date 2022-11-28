import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchTags } from '../../store/slices/tagSlice/thunks';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { NotFound } from '../NotFound';
import { TagDetailPresenter } from './tag-detail.presenter';

export const TagDetailContainer = (): JSX.Element => {
    /**
     * TODO Once tags follow the standard `IIndexQueryResult`, refactor this logic
     * and use the same hooks used in resource index-to-detail flows.
     */
    const idFromLocation = useIdFromLocation();

    const dispatch = useAppDispatch();

    const isLoading = useSelector((state: RootState) => state.tags.isLoading);

    const allTags = useSelector((state: RootState) => state.tags.data);

    const errorInfo = useSelector((state: RootState) => state.tags.errorInfo);

    useEffect(() => {
        if (allTags === null) {
            dispatch(fetchTags());
        }
    }, [allTags, dispatch]);

    if (errorInfo) return <ErrorDisplay {...errorInfo}></ErrorDisplay>;

    if (isLoading) return <Loading></Loading>;

    if (allTags === null) {
        return <Loading></Loading>;
    }

    const tag = allTags.find(({ id }) => id === idFromLocation);

    if (!tag) return <NotFound />;

    return <TagDetailPresenter {...tag}></TagDetailPresenter>;
};