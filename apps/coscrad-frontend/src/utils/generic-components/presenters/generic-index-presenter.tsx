import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../types/functional-component';
import './generic-presenters.css';
import { GenericTableRowPresenter } from './tables';

export const GenericIndexPresenter: FunctionalComponent<IIndexQueryResult<IBaseViewModel>> = ({
    data: viewModelsAndActions,
}: IIndexQueryResult<IBaseViewModel>) => {
    const viewModels = viewModelsAndActions.map(({ data }) => data);

    return (
        <div>
            <h3>Records</h3>
            <div className="records-table">
                <table border={1} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <th>Link</th>
                            {Object.keys(viewModels[0]).map((propertyName) => (
                                <th>{propertyName}</th>
                            ))}
                        </tr>
                        {viewModels.map((viewModel) => (
                            <GenericTableRowPresenter key={viewModel.id} {...viewModel} />
                        ))}
                    </tbody>
                </table>
            </div>
            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>{JSON.stringify(viewModels, null, 2)}</pre>
            </div>
        </div>
    );
};
