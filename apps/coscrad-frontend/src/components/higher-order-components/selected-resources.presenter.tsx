import { CategorizableType, IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { NotFound } from '../NotFound';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';

interface SelectedResourcesPresenterProps<T extends IBaseViewModel> {
    viewModels: (IDetailQueryResult<T> | NOT_FOUND)[];
    presenterFactory: ICategorizableDetailPresenterFactory<IDetailQueryResult<T>>;
    categorizableType: CategorizableType;
}

export const SelectedCategorizablePresenter = <T extends IBaseViewModel>({
    viewModels,
    presenterFactory,
    categorizableType,
}: SelectedResourcesPresenterProps<T>): JSX.Element => {
    const Presenter = presenterFactory(categorizableType);

    return (
        <div>
            {/* TODO Use a label here */}
            <h2>{categorizableType}s</h2>
            {viewModels.map((viewModel, index) => (
                <div key={index}>
                    {viewModel === NOT_FOUND ? <NotFound /> : <Presenter {...viewModel} />}
                </div>
            ))}
        </div>
    );
};
