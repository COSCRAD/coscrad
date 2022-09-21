import { getConfig } from '../../../config';
import buildIndexComponent from '../../../HigherOrderComponents/buildIndexCommponent/buildIndexComponent';

const VideoIndex = buildIndexComponent(
    [
        {
            propertyKey: 'title',
            heading: 'Title',
        },
        {
            propertyKey: 'titleEnglish',
            heading: 'Title (English)',
        },
        {
            propertyKey: 'id',
            heading: 'ID',
        },
    ],
    (id: string) => `${id}`,
    `${getConfig().apiBaseUrl}/api/resources/mediaItems`,
    'Videos'
);

export default VideoIndex;
