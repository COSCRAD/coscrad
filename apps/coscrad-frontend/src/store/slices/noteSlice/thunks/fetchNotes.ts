import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/createFetchThunk';
import { NOTES } from '../constants';

export const fetchNotes = createFetchThunk(
    `${NOTES}/fetch`,
    `${getConfig().apiUrl}/connections/notes`
);
