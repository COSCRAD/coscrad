import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Grid, IconButton, styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { buildDataAttributeForAggregateDetailComponent } from '../../../shared/build-data-attribute-for-aggregate-detail-component';
import { SinglePropertyPresenter } from '../../../shared/single-property-presenter';
import { getOriginalTextItem } from '../../terms/term-detail.page';

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

    const originalName = getOriginalTextItem(name);

    const imageUrl = 'https://kaaltsidakah.net/raven/Map/Previews/XK-Xuuya-Preview.png';

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
                <Typography variant="h5">{originalName.text}</Typography>
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
