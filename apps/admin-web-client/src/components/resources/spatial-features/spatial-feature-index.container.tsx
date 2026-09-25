import { useEffect, useState } from 'react';
import { CoscradLeafletMap } from './leaflet';
import { spatialFeatureApi } from './store/spatial-feature.api';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';

export const SpatialFeatureIndexContainer = (): JSX.Element => {
    const [selectedSpatialFeatureId, setSelectedSpatialFeatureId] = useState<string>(null);

    // May need to force a refetch under certain circumstances.  A
    // mutation may force a refetch
    const {
        data: serverData,
        isLoading,
        isFetching,
        isError,
    } = spatialFeatureApi.endpoints.fetchSpatialFeatures.useQuery();

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
        <CoscradLeafletMap
            spatialFeatures={spatialFeatures}
            onSpatialFeatureSelected={(id: string) => setSelectedSpatialFeatureId(id)}
            DetailPresenter={SpatialFeatureDetailThumbnailPresenter}
            selectedSpatialFeatureId={selectedSpatialFeatureId}
        />
    );
};
