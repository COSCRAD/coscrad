import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { FunctionalComponent } from '../../utils/types/functional-component';

export const NotFoundPresenter: FunctionalComponent = (): JSX.Element => {
    const { notFoundMessage } = useContext(ConfigurableContentContext);

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
            {notFoundMessage}
        </Box>
    );
};
