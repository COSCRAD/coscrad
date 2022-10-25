import { RootState } from '../../store';
import { fetchTags } from '../../store/slices/tagSlice/thunks';
import { useLoadable } from '../../utils/custom-hooks/useLoadable';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { TagIndexPresenter } from './TagIndex.presenter';

export const TagIndexContainer = (): JSX.Element => {
    const [loadableTags] = useLoadable({
        selector: (state: RootState) => state.tags,
        fetchThunk: fetchTags,
    });

    const { data: tagsData, isLoading, errorInfo } = loadableTags;

    if (errorInfo) return <ErrorDisplay {...errorInfo}></ErrorDisplay>;

    if (isLoading || tagsData === null) return <Loading></Loading>;

    return <TagIndexPresenter viewModels={tagsData}></TagIndexPresenter>;
};
