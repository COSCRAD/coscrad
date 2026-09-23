import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { spatialFeatureApi } from './store/spatial-feature.api';

export const SpatialFeatureIndexContainer = (): JSX.Element => {
    // May need to force a refetch under certain circumstances.  A
    // mutation may force a refetch
    const {
        data: serverData,
        isLoading,
        isFetching,
        isError,
    } = spatialFeatureApi.endpoints.fetchSpatialFeatures.useQuery();

    console.log({ serverData });

    // This is the flicker free term set held in place.  `setRenderedData()` is only
    // triggered when the new data is fully fetched (i.e., `!isFetching`)
    const [renderedData, setRenderedData] = useState(serverData);

    useEffect(() => {
        if (serverData && !isFetching) {
            setRenderedData(serverData);
        }
    }, [serverData, isFetching]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving data.</div>;

    const spatialFeatures = renderedData?.entities;

    return (
        <Stack>
            {!isNullOrUndefined(spatialFeatures)
                ? spatialFeatures.map(({ id, name: { items }, geometry, properties }) => (
                      <Typography key={id} variant="h2">
                          {items[0].text}
                      </Typography>
                  ))
                : null}
        </Stack>
    );
};
