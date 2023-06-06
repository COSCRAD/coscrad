import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import {
    Audiotrack as AudiotrackIcon,
    AutoStories as AutoStoriesIcon,
    CollectionsBookmark as CollectionsBookmarkIcon,
    Language as LanguageIcon,
    List as ListIcon,
    Photo as PhotoIcon,
    Place as PlaceIcon,
    PlaylistPlay as PlaylistPlayIcon,
    Subscriptions as SubscriptionsIcon,
    Videocam as VideocamIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { displayLoadableWithErrorsAndLoading } from '../../../../components/higher-order-components';
import { useLoadableResourceInfoWithConfigOverrides } from '../../../../store/slices/resources/resource-info/hooks';

/**
 * TODO[https://www.pivotaltracker.com/story/show/184664117] Create an icon factory that enables custom icons
 */

type Color = string;

interface ResourcePreviewImageProps {
    resourceType: ResourceType;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: Color;
}

/**
 *
 * TODO: move lookupTable into a global location for use by all presenters needing
 * a generic resource icon
 *
 */

const lookupTable: { [K in ResourceType]: JSX.Element } = {
    [ResourceType.audioItem]: <VolumeUpIcon fontSize="inherit" />,
    [ResourceType.bibliographicReference]: <CollectionsBookmarkIcon fontSize="inherit" />,
    [ResourceType.book]: <AutoStoriesIcon fontSize="inherit" />,
    [ResourceType.mediaItem]: <SubscriptionsIcon fontSize="inherit" />,
    [ResourceType.photograph]: <PhotoIcon fontSize="inherit" />,
    [ResourceType.song]: <AudiotrackIcon fontSize="inherit" />,
    [ResourceType.spatialFeature]: <PlaceIcon fontSize="inherit" />,
    [ResourceType.term]: <LanguageIcon fontSize="inherit" />,
    [ResourceType.video]: <VideocamIcon fontSize="inherit" />,
    [ResourceType.vocabularyList]: <ListIcon fontSize="inherit" />,
    [ResourceType.playlist]: <PlaylistPlayIcon fontSize="inherit" />,
};

const sizes = {
    xs: '20px',
    sm: '40px',
    md: '60px',
    lg: '100px',
    xl: '200px',
};

const ResourceIconPresenter = ({
    resourceType,
    size = 'md',
    color,
    resourceInfos,
}: ResourcePreviewImageProps & { resourceInfos: IAggregateInfo[] }): JSX.Element => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(`Failed to build an icon for resource type: ${resourceType}`);
    }

    const label = resourceInfos.find(
        ({ type: resourceTypeForThisInfoItem }) => resourceType === resourceTypeForThisInfoItem
    ).label;

    const iconSize = sizes[size];

    return (
        <Box sx={{ fontSize: iconSize, maxHeight: iconSize, color: color }}>
            <Tooltip title={label}>{lookupResult}</Tooltip>
        </Box>
    );
};

export const ResourcePreviewIconFactory = ({
    resourceType,
    size = 'md',
    color,
}: ResourcePreviewImageProps): JSX.Element => {
    /**
     * We do this here because it  avoids the complexity
     * of drilling a lot of state through from the resource presenters and keeps
     * the logic extensible to adding new resource types.
     */
    const loadableResourceInfos = useLoadableResourceInfoWithConfigOverrides();

    const Presenter = displayLoadableWithErrorsAndLoading(
        ResourceIconPresenter,
        (resourceInfos: IAggregateInfo[]) => ({
            resourceType,
            size,
            color,
            resourceInfos,
        })
    );

    return <Presenter {...loadableResourceInfos} />;
};
