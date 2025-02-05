import { IIndexQueryResult, IVocabularyListViewModel, WithTags } from '@coscrad/api-interfaces';
import { getConfig } from '../../../../../config';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { VOCABULARY_LISTS } from '../constants';
import { VocabularyListIndexState } from '../types/vocabulary-list-index-state';

export const fetchVocabularyLists = createFetchThunk<VocabularyListIndexState>(
    buildResourceFetchActionPrefix(VOCABULARY_LISTS),
    `${getApiResourcesBaseRoute()}/vocabularyLists`,
    // TODO Make this the responsibility of the back-end
    (
        serverResponse: IIndexQueryResult<WithTags<IVocabularyListViewModel>>
    ): IIndexQueryResult<WithTags<IVocabularyListViewModel>> => {
        const { apiUrl } = getConfig();

        /**
         * TODO Phase the following mapping layer out in favour
         * of doing this work on the server.
         */
        return {
            ...serverResponse,
            entities: (serverResponse.entities || []).map((entity) => {
                return {
                    ...entity,
                    entries: (entity.entries || []).map((entry) => ({
                        ...entry,
                        term: {
                            ...entry.term,
                            audioURL: `${apiUrl}/resources/mediaItems/download/${entry.term.mediaItemId}`,
                        },
                    })),
                };
            }),
        };
    }
);
