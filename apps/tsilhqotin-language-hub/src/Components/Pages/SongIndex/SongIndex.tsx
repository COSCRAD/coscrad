import { getConfig } from '../../../config';
import buildIndexComponent from '../../../HigherOrderComponents/buildIndexCommponent/buildIndexComponent';

const SongIndex = buildIndexComponent(
    [
        {
            propertyKey: 'title',
            heading: 'Title',
        },
        {
            propertyKey: 'titleEnglish',
            heading: 'Title (English)',
        },
    ],
    (id: string) => `${id}`,
    `${getConfig().apiBaseUrl}/api/resources/songs`,
    'Songs'
);

export default SongIndex;
