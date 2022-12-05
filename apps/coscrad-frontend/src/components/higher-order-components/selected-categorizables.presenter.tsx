import { CategorizableType, IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { NotFound } from '../NotFound';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';

interface SelectedCategorizablesPresenterProps<T extends IBaseViewModel> {
    viewModels: (IDetailQueryResult<T> | NOT_FOUND)[];
    presenterFactory: ICategorizableDetailPresenterFactory<IDetailQueryResult<T>>;
    categorizableType: CategorizableType;
    pluralLabelForCategorizableType: string;
}

export const SelectedCategorizablesPresenter = <T extends IBaseViewModel>({
    viewModels,
    presenterFactory,
    categorizableType,
    pluralLabelForCategorizableType,
}: SelectedCategorizablesPresenterProps<T>): JSX.Element => {
    const Presenter = presenterFactory(categorizableType);

    return (
        <div>
            {/* TODO Use a label here */}
            <h2>{pluralLabelForCategorizableType}</h2>
            {viewModels.map((viewModel, index) => (
                <div key={index}>
                    {viewModel === NOT_FOUND ? <NotFound /> : <Presenter {...viewModel} />}
                </div>
            ))}
        </div>
    );
};
