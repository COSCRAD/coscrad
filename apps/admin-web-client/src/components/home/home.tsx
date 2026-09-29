import { Typography } from '@mui/material';
import { DetailViewFormatter } from '../shared/detail-view-formatter';

export const Home = (): JSX.Element => (
    <DetailViewFormatter>
        <Typography variant="h4">
            Hello, this is the Home Page. Use the nav above to view language terms.
        </Typography>
    </DetailViewFormatter>
);
