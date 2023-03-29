import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { FunctionalComponent } from '../../utils/types/functional-component';

export const NotFoundPresenter: FunctionalComponent = (): JSX.Element => {
    const { notFoundMessage } = useContext(ConfigurableContentContext);
    return (
        <Typography sx={{ padding: '3em' }} variant="h5" data-testid="notFound">
            <SearchOffIcon sx={{ verticalAlign: 'text-bottom', paddingRight: '0.5em' }} />
            {notFoundMessage}
        </Typography>
    );
};
