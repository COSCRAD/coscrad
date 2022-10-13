import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Loading } from '../Loading';
import ResourceInfoPresenter, {
    ResourceInfo,
} from '../presenters/ResourceInfoPresenter/ResourceInfoPresenter';
import './AllEntities.module.scss';

type ComponentState = {
    resourceInfos: ResourceInfo[];
};

export function AllResources() {
    const resourceInfos = useSelector((state: RootState) => state.resources.infos);

    const isLoading = useSelector((state: RootState) => state.resources.isLoading);

    if (isLoading) return <Loading></Loading>;

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
