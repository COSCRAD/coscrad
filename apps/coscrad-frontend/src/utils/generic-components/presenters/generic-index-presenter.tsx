import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../types/functional-component';
import './generic-detail-presenter.css';
import { GenericTableRowPresenter } from './tables';

export const GenericIndexPresenter: FunctionalComponent<IIndexQueryResult<IBaseViewModel>> = ({
    data: viewModelsAndActions,
}: IIndexQueryResult<IBaseViewModel>) => {
    const viewModels = viewModelsAndActions.map(({ data }) => data);

    return (
        <div>
            <h3>JSON Data</h3>
            <div className="json-data">{JSON.stringify(viewModels)}</div>
            <h3>Records</h3>
            <div className="records-table">
                <table border={1} cellSpacing={0}>
                    <tbody>
                        {viewModels.map((viewModel) => (
                            <GenericTableRowPresenter key={viewModel.id} {...viewModel} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
