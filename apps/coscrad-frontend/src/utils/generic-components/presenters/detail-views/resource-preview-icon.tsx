import { ResourceType } from '@coscrad/api-interfaces';
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

export const ResourcePreviewIconFactory = ({
    resourceType,
    size = 'md',
    color,
}: ResourcePreviewImageProps): JSX.Element => {
    const lookupResult = lookupTable[resourceType];

    const iconSize = sizes[size];

    if (!lookupResult) {
        throw new Error(`Failed to build an icon for resource type: ${resourceType}`);
    }

    return (
        <Box sx={{ fontSize: iconSize, maxHeight: iconSize, color: color }}>
            {/* TODO: capitalize resource type */}
            <Tooltip title={resourceType}>{lookupResult}</Tooltip>
        </Box>
    );
};
