import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { NotFoundPresenter } from '../not-found';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';

export interface SelectedCategorizablesPresenterProps<T extends IBaseViewModel = IBaseViewModel> {
    viewModels: (ICategorizableDetailQueryResult<T> | NOT_FOUND)[];
    presenterFactory: ICategorizableDetailPresenterFactory<ICategorizableDetailQueryResult<T>>;
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
        <div key={pluralLabelForCategorizableType}>
            <Typography variant="h4">{pluralLabelForCategorizableType}</Typography>
            {viewModels.map((viewModel, index) => (
                <div key={index}>
                    {viewModel === NOT_FOUND ? <NotFoundPresenter /> : <Presenter {...viewModel} />}
                </div>
            ))}
        </div>
    );
};
