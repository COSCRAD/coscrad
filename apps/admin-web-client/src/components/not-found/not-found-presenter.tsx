import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box } from '@mui/material';
import { FunctionalComponent } from '../shared/types';

export const NotFoundPresenter: FunctionalComponent = (): JSX.Element => {
    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            width={'100%'}
            padding={'3em 0 3em 0'}
            data-testid="not-found"
        >
            <SearchOffIcon sx={{ verticalAlign: 'text-bottom', paddingRight: '0.5em' }} />
            Item Not Found
        </Box>
    );
};
