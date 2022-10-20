import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchTags } from '../../store/slices/tagSlice/thunks';
import { Loading } from '../Loading';
import { TagDetailPresenter } from './TagDetail.presenter';

export const TagDetailContainer = (): JSX.Element => {
    const { id: idFromLocation } = useParams();

    const dispatch = useAppDispatch();

    const isLoading = useSelector((state: RootState) => state.tags.isLoading);

    const allTags = useSelector((state: RootState) => state.tags.data);

    if (isLoading) return <Loading></Loading>;

    if (allTags === null) {
        dispatch(fetchTags());

        return <Loading></Loading>;
    }

    const tag = allTags.find(({ id }) => id === idFromLocation);

    if (!tag) return <div>Not Found</div>;

    return <TagDetailPresenter {...tag}></TagDetailPresenter>;
};
