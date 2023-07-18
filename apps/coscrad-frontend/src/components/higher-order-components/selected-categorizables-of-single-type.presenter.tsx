import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { Box, Stack, Typography, styled } from '@mui/material';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { NotFoundPresenter } from '../not-found';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';

export interface SelectedCategorizablesPresenterProps<T extends IBaseViewModel = IBaseViewModel> {
    viewModels: (ICategorizableDetailQueryResult<T> | NOT_FOUND)[];
    presenterFactory: ICategorizableDetailPresenterFactory<ICategorizableDetailQueryResult<T>>;
    categorizableType: CategorizableType;
    pluralLabelForCategorizableType: string;
}

const Item = styled(Box)(({ theme }) => ({
    padding: 0,
    marginBottom: '15px',
}));

export const SelectedCategorizablesPresenter = <T extends IBaseViewModel>({
    viewModels,
    presenterFactory,
    categorizableType,
    pluralLabelForCategorizableType,
}: SelectedCategorizablesPresenterProps<T>): JSX.Element => {
    const Presenter = presenterFactory(categorizableType);

    return (
        <Stack sx={{ width: '93%' }} key={pluralLabelForCategorizableType}>
            <Typography variant="h4">{pluralLabelForCategorizableType}</Typography>
            {viewModels.map((viewModel, index) => (
                <Item key={index}>
                    {viewModel === NOT_FOUND ? <NotFoundPresenter /> : <Presenter {...viewModel} />}
                </Item>
            ))}
        </Stack>
    );
};
