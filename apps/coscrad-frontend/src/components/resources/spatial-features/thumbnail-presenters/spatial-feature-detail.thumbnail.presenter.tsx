import {
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Grid, styled } from '@mui/material';
import { routes } from '../../../../app/routes/routes';
import { SinglePropertyPresenter } from '../../../../utils/generic-components';
import { ResourceNamePresenter } from '../../../../utils/generic-components/presenters/resource-name-presenter';
import { ResourceNavLink } from '../../shared/resource-nav-link';

const StyledPlaceIcon = styled('img')({
    width: '60px',
});

/**
 * Our current approach is to present a text summary of the coordinates for a
 * spatial feature in its thumbnail view.
 */
export const SpatialFeatureDetailThumbnailPresenter = (
    spatialFeature: ICategorizableDetailQueryResult<ISpatialFeatureViewModel>
): JSX.Element => {
    const { id, geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${id} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${id} is missing its properties`);
    }

    const { name, description, imageUrl } = properties;

    const { type: geometryType } = geometry;

    return (
        <Grid container spacing={0}>
            <Grid item xs={3}>
                <div data-testid={id} />
                {/* Preview will eventually include images taken from video or photos, etc. */}
                <StyledPlaceIcon src={imageUrl} alt={`Spatial Feature ${id}`} />
            </Grid>
            <Grid item xs={9}>
                {/* TODO: consider putting a standardized name property on the view models */}
                <ResourceNamePresenter name={name} variant="h5" />
                <SinglePropertyPresenter display="Description" value={description} />
                <SinglePropertyPresenter display="Feature Type" value={geometryType} />
            </Grid>
            <Grid item xs={12} container sx={{ justifyContent: 'flex-end' }}>
                <ResourceNavLink
                    iconSx={{ fontSize: '20px' }}
                    internalLink={`/${routes.resources
                        .ofType(ResourceType.spatialFeature)
                        .detail(id)}`}
                />
            </Grid>
        </Grid>
    );
};
