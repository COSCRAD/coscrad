import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Grid, IconButton, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { buildDataAttributeForAggregateDetailComponent } from '../../../shared/build-data-attribute-for-aggregate-detail-component';
import { ResourceNamePresenter } from '../../../shared/resource-name-presenter';
import { SinglePropertyPresenter } from '../../../shared/single-property-presenter';

const StyledPlaceIcon = styled('img')({
    width: '60px',
});

/**
 * Our current approach is to present a text summary of the coordinates for a
 * spatial feature in its thumbnail view.
 *
 * TODO [https://www.pivotaltracker.com/story/show/184932759] create a separate
 * presenter for the marker pop-up instead of re-using the thumbnail presenter
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

    const { name, description } = properties;

    const imageUrl = 'https://kaaltsidakah.net/raven/Map/Previews/XK-Xuuya-Preview.png';

    console.log({ imageUrl });

    const { type: geometryType } = geometry;

    return (
        <Grid container spacing={0}>
            <Grid item xs={3}>
                <div
                    data-testid={buildDataAttributeForAggregateDetailComponent(
                        AggregateType.spatialFeature,
                        id
                    )}
                />
                {/* Preview will eventually include images taken from video or photos, etc. */}
                <StyledPlaceIcon src={imageUrl} alt={`Spatial Feature ${id}`} />
            </Grid>
            <Grid item xs={9}>
                <ResourceNamePresenter name={name} variant="h5" />
                <SinglePropertyPresenter display="Description" value={description.items[0].text} />
                <SinglePropertyPresenter display="Feature Type" value={geometryType} />
            </Grid>
            <Grid item xs={12} container sx={{ justifyContent: 'flex-end' }}>
                <Box sx={{ pl: 8 }}>
                    <Link to={`/resources/spatialFeatures/${id}`}>
                        <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                            <ArrowForwardIosIcon sx={{ fontSize: '20px' }} />
                        </IconButton>
                    </Link>
                </Box>
            </Grid>
        </Grid>
    );
};
