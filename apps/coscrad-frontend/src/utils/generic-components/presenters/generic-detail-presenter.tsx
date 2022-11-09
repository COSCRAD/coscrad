import { IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { CommandPanel } from '../../../components/commands';
import { NotFound } from '../../../components/NotFound';
import { NOT_FOUND } from '../../../store/slices/interfaces/maybe-loadable.interface';
import { GenericTableRowPresenter } from './tables';

export const GenericDetailPresenter = ({
    actions,
    data: viewModel,
}: IDetailQueryResult<IBaseViewModel>) => {
    if ((viewModel as unknown) === NOT_FOUND) return <NotFound />;

    if (!viewModel) {
        throw new Error(`Invalid data received by GenericDetailPresenter: ${viewModel}`);
    }

    return (
        <div data-testid={viewModel.id}>
            <h1>Record View</h1>
            <div className="records-table">
                <table border={1} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <th>Link</th>
                            {Object.keys(viewModel).map((propertyName) => (
                                <th>{propertyName}</th>
                            ))}
                        </tr>
                        <GenericTableRowPresenter
                            key={viewModel.id}
                            linkStatus={false}
                            {...viewModel}
                        />
                    </tbody>
                </table>
            </div>

            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>{JSON.stringify(viewModel, null, 2)}</pre>
            </div>

            <div className="actions">
                <CommandPanel actions={actions} />
            </div>
        </div>
    );
};
