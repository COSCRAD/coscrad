import { INoteViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/createFetchThunk';
import { NOTES } from '../constants';

export const fetchNotes = createFetchThunk<INoteViewModel[]>(
    `${NOTES}/fetch`,
    `${getConfig().apiUrl}/connections/notes`
);
