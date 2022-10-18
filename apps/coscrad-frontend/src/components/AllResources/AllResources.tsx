import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchResourceInfos } from '../../store/slices/resourceInfoSlice';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import ResourceInfoPresenter from '../presenters/ResourceInfoPresenter/ResourceInfoPresenter';
import './AllEntities.module.scss';

export function AllResources() {
    const resourceInfos = useSelector((state: RootState) => state.resources.infos);

    const isLoading = useSelector((state: RootState) => state.resources.isLoading);

    const errorInfo = useSelector((state: RootState) => state.resources.errorInfo);

    const dispatch = useAppDispatch();

    if (errorInfo) return <ErrorDisplay {...errorInfo}></ErrorDisplay>;

    if (isLoading) return <Loading></Loading>;

    // There will never be a case where the API query actually returns []
    if (resourceInfos.length === 0) dispatch(fetchResourceInfos());

    return (
        <div>
            <h1>Available Resources</h1>
            <div>
                {resourceInfos.map((info) => (
                    <ResourceInfoPresenter {...info} key={info.type}></ResourceInfoPresenter>
                ))}
            </div>
        </div>
    );
}
