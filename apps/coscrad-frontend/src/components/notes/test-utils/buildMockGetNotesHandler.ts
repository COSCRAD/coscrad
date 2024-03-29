import { INoteViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildDummyNotes } from './build-dummy-notes';

export const buildMockGetNotesHandler = (notes?: INoteViewModel[]) =>
    buildMockSuccessfulGETHandler({
        endpoint: `${getConfig().apiUrl}/connections/notes`,
        response: buildMockIndexResponse(
            (notes || buildDummyNotes()).map((note) => [note, []]),
            []
        ),
    });
