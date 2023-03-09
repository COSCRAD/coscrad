import { ResourceType } from '@coscrad/api-interfaces';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import LanguageIcon from '@mui/icons-material/Language';
import ListIcon from '@mui/icons-material/List';
import PhotoIcon from '@mui/icons-material/Photo';
import PlaceIcon from '@mui/icons-material/Place';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box } from '@mui/material';
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

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

    return <Box sx={{ fontSize: iconSize, maxHeight: iconSize, color: color }}>{lookupResult}</Box>;
};
