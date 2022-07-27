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
        {
            propertyKey: 'id',
            heading: 'ID',
        },
    ],
    (id: string) => `${id}`,
    `${getConfig().apiBaseUrl}/api/resources/songs`
);

export default SongIndex;
