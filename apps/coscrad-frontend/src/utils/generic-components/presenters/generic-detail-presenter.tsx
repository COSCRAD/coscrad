import { IBaseViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { CommandPanel } from '../../../components/dynamicViews/commands';
import { NotFound } from '../../../components/NotFound';
import { NOT_FOUND } from '../../../store/slices/interfaces/maybe-loadable.interface';

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
            <h1>Data</h1>
            {JSON.stringify(viewModel)}

            <CommandPanel actions={actions} />
        </div>
    );
};
