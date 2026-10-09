import { Typography } from '@mui/material';
import { PageContentLayout } from '../shared/page-content-layout';

export const Home = (): JSX.Element => (
    <PageContentLayout>
        <Typography variant="h4">
            Hello, this is the Home Page. Use the nav above to view language terms.
        </Typography>
    </PageContentLayout>
);
