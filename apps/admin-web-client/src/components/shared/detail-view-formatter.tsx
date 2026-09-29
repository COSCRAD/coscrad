import { Box } from '@mui/material';

export const DetailViewFormatter = ({ children }): JSX.Element => (
    <Box sx={{ paddingTop: '120px', ml: 10, mr: 10, mb: 5, width: '87%' }}>{children}</Box>
);
