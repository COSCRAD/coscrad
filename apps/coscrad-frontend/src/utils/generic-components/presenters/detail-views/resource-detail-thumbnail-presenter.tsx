import { IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined, isString } from '@coscrad/validation-constraints';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { routes } from '../../../../app/routes/routes';
import { ResourceNavLink } from '../../../../components/resources/shared/resource-nav-link';
import { MultilingualTextPresenter } from '../multilingual-text-presenter';
import { ResourcePreviewIconFactory } from './resource-preview-icon';

export interface ResourceDetailThumbnailPresenterProps {
    id: string;
    type: ResourceType;
    name: IMultilingualText | string;
    children: ReactNode;
}

/**
 * This generic component is meant to serve as a single-source of truth for
 * the look and feel of a Resource's thumbnail detail view. We adapt the
 * view models \ data to this API in the specific thumbnail detail views for
 * each resource.
 *
 * This is WIP. We will solidify the API as we make our first pass of the resources.
 */
export const ResourceDetailThumbnailPresenter = ({
    id,
    type,
    name,
    children,
}: ResourceDetailThumbnailPresenterProps): JSX.Element => (
    <Card>
        <CardContent>
            <Grid container spacing={1} columns={{ xs: 2, sm: 4, md: 12 }}>
                <Grid item xs={2} sm={1} md={2}>
                    {/* Preview will eventually include images taken from video or photos, etc. */}
                    <ResourcePreviewIconFactory resourceType={type} />
                </Grid>
                <Grid item xs={2} sm={2} md={8}>
                    {/* TODO: consider putting a standardized name property on the view models */}
                    <Typography gutterBottom variant="h6" fontWeight="bold" color="primary">
                        {isString(name) || isNullOrUndefined(name) ? (
                            name
                        ) : (
                            <MultilingualTextPresenter text={name} />
                        )}
                    </Typography>
                    {children}
                </Grid>
                <Grid item xs={2} sm={1} md={2} container sx={{ justifyContent: 'flex-end' }}>
                    <ResourceNavLink linkURL={`/${routes.resources.ofType(type).detail(id)}`} />
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);
