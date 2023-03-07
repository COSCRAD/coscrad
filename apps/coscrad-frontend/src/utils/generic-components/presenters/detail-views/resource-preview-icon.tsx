import { ResourceType } from '@coscrad/api-interfaces';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import LanguageIcon from '@mui/icons-material/Language';
import ListIcon from '@mui/icons-material/List';
import PhotoIcon from '@mui/icons-material/Photo';
import PlaceIcon from '@mui/icons-material/Place';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box } from '@mui/material';

interface ResourcePreviewImageProps {
    resourceType: ResourceType;
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
};

export const ResourcePreviewIconFactory = ({
    resourceType,
}: ResourcePreviewImageProps): JSX.Element => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(`Failed to build an icon for resource type: ${resourceType}`);
    }

    return <Box sx={{ fontSize: '100px', maxHeight: '100px' }}>{lookupResult}</Box>;
};
