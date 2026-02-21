import { INoteViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { NOTES } from '../constants';

export const fetchNotes = createFetchThunk<INoteViewModel[]>(
    `${NOTES}/fetch`,
    // this returns simple notes and connections
    `${getConfig().apiUrl}/webOfKnowledge`
);
