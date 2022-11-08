import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../types/functional-component';
import './generic-detail-presenter.css';

export const GenericIndexPresenter: FunctionalComponent<IIndexQueryResult<IBaseViewModel>> = ({
    data: viewModelsAndActions,
}: IIndexQueryResult<IBaseViewModel>) => {
    const viewModels = viewModelsAndActions.map(({ data }) => data);

    const displayDataTableRow = (tableDataRow: IBaseViewModel) => {
        return (
            <tr>
                {Object.entries(tableDataRow).map(([key, value]) => {
                    return (
                        <td>{key}: {value}</td>
                    )
                })}
            </tr>
        );
    };

    return (
        <div>
            <h3>JSON Data</h3>
            <div className="json-data">{JSON.stringify(viewModels)}</div>
            <h3>Records</h3>
            <div className="records-table">
                <table border={1} cellSpacing={0}>
                    {viewModels.map((viewModel) => (
                        {displayDataTableRow(viewModel)}
                    ))}
                </table>
            </div>
        </div>
    );
};
