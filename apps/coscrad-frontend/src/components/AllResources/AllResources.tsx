import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchResourceInfos } from '../../store/slices/resourceInfoSlice';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import ResourceInfoPresenter from '../presenters/ResourceInfoPresenter/ResourceInfoPresenter';

export function AllResources(): JSX.Element {
    const resourceInfos = useSelector((state: RootState) => state.resourceInfo.data);

    const isLoading = useSelector((state: RootState) => state.resourceInfo.isLoading);

    const errorInfo = useSelector((state: RootState) => state.resourceInfo.errorInfo);

    const dispatch = useAppDispatch();

    if (errorInfo) return <ErrorDisplay {...errorInfo}></ErrorDisplay>;

    if (isLoading) return <Loading></Loading>;

    // There will never be a case where the API query actually returns []
    if (resourceInfos.length === 0) dispatch(fetchResourceInfos());

    return (
        <div>
            <h2>Available Resources</h2>
            <div>
                {resourceInfos.map((info) => (
                    <ResourceInfoPresenter {...info} key={info.type}></ResourceInfoPresenter>
                ))}
            </div>
        </div>
    );
}
