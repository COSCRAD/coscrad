import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Stack, Typography, styled } from '@mui/material';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { NotFoundPresenter } from '../not-found';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';
import { ConnectionNotePresenter } from './connection-note';
import { NotesById } from './selected-categorizables-of-multiple-types.presenter';

const Item = styled(Box)({
    padding: 0,
    marginBottom: '25px',
});

export interface SelectedCategorizablesPresenterProps<T extends IBaseViewModel = IBaseViewModel> {
    viewModels: (ICategorizableDetailQueryResult<T> | NOT_FOUND)[];
    presenterFactory: ICategorizableDetailPresenterFactory<ICategorizableDetailQueryResult<T>>;
    notesById?: NotesById[];
    categorizableType: CategorizableType;
    pluralLabelForCategorizableType: string;
}

export const SelectedCategorizablesPresenter = <T extends IBaseViewModel>({
    viewModels,
    presenterFactory,
    notesById,
    categorizableType,
    pluralLabelForCategorizableType,
}: SelectedCategorizablesPresenterProps<T>): JSX.Element => {
    const Presenter = presenterFactory(categorizableType);

    return (
        <Stack sx={{ width: '93%', padding: '1px' }} key={pluralLabelForCategorizableType}>
            <Typography variant="h4">{pluralLabelForCategorizableType}</Typography>
            {viewModels.map((viewModel, index) => (
                <Item key={index}>
                    {viewModel === NOT_FOUND ? (
                        <NotFoundPresenter />
                    ) : (
                        <>
                            <Presenter {...viewModel} />
                            {!isNullOrUndefined(notesById) ? (
                                <ConnectionNotePresenter
                                    viewModel={viewModel}
                                    notesById={notesById}
                                />
                            ) : null}
                        </>
                    )}
                </Item>
            ))}
        </Stack>
    );
};
