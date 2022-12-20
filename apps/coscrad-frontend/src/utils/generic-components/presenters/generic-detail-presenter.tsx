import { IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { NotFoundPresenter } from '../../../components/not-found';
import { NOT_FOUND } from '../../../store/slices/interfaces/maybe-loadable.interface';

export const GenericDetailPresenter = (viewModel: IDetailQueryResult<IBaseViewModel>) => {
    if ((viewModel as unknown) === NOT_FOUND) return <NotFoundPresenter />;

    if (!viewModel) {
        throw new Error(`Invalid data received by GenericDetailPresenter: ${viewModel}`);
    }

    return (
        <div data-testid={viewModel.id}>
            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>{JSON.stringify(viewModel, null, 2)}</pre>
            </div>
        </div>
    );
};
