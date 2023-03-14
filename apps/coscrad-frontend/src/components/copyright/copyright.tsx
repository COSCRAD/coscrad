import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export const Copyright = () => {
    const { copyrightHolder } = useContext(ConfigurableContentContext);

    return (
        <Typography color="text.secondary">
            &copy; {new Date().getFullYear()} {copyrightHolder}
        </Typography>
    );
};
