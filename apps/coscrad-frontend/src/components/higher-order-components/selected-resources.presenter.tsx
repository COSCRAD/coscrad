import { IBaseViewModel, IDetailQueryResult, ResourceType } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { NotFound } from '../NotFound';
import { IResourceDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';

interface SelectedResourcesPresenterProps<T extends IBaseViewModel> {
    viewModels: (IDetailQueryResult<T> | NOT_FOUND)[];
    presenterFactory: IResourceDetailPresenterFactory<IDetailQueryResult<T>>;
    resourceType: ResourceType;
}

export const SelectedResourcesPresenter = <T extends IBaseViewModel>({
    viewModels,
    presenterFactory,
    resourceType,
}: SelectedResourcesPresenterProps<T>): JSX.Element => {
    const Presenter = presenterFactory(resourceType);

    return (
        <div>
            {/* TODO Use a label here */}
            <h2>{resourceType}s</h2>
            {viewModels.map((viewModel, index) => (
                <div key={index}>
                    {viewModel === NOT_FOUND ? <NotFound /> : <Presenter {...viewModel} />}
                </div>
            ))}
        </div>
    );
};
