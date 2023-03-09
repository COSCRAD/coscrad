import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { ResourcePreviewIconFactory } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/detail-views/resource-preview-icon';
import { Link } from 'react-router-dom';

export const ResourceInfoPresenter = ({
    type,
    description,
    label,
    route,
}: /**
 * TODO [https://www.pivotaltracker.com/story/show/183766033
 * We should expose the Schema as part of our own API docs somehow.
 */
IAggregateInfo<ResourceType> & { route: string }): JSX.Element => (
    <Link to={`/${route}`}>
        <Card>
            {/* TODO Handle pluralization properly as soon as we have a Resource Type whose plural form is irregular */}
            {/* <CardHeader title={label} /> */}
            <CardContent>
                <Grid container justifyContent="flex-start" spacing="10" direction="row" mb={2}>
                    <Grid item>
                        <ResourcePreviewIconFactory resourceType={type} size="md" color="#1565c0" />
                    </Grid>
                    {/* For the `xs` see https://github.com/mui/material-ui/issues/11339
                        Seems like it's still broken in @material-ui/core ^4.12.3 */}
                    <Grid item zeroMinWidth xs>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            {label}
                        </Typography>
                        <div style={{ height: '1px' }} data-testid={label}>
                            &nbsp;
                        </div>
                        <Typography component="div">{description}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    </Link>
);
