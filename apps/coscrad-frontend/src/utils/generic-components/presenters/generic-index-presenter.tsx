import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { FunctionalComponent } from '../../types/functional-component';

export const GenericIndexPresenter: FunctionalComponent<IIndexQueryResult<IBaseViewModel>> = ({
    data: viewModelsAndActions,
}: IIndexQueryResult<IBaseViewModel>) => {
    const viewModels = viewModelsAndActions.map(({ data }) => data);

    return (
        <div>
            {viewModels.map((viewModel) => (
                <Link to={viewModel.id} key={viewModel.id}>
                    <div data-testid={viewModel.id}>{JSON.stringify(viewModel)}</div>
                </Link>
            ))}
        </div>
    );
};
