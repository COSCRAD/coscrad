import { IIndexQueryResult, ISongViewModel, WithTags } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { getConfig } from '../../../../../config';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { SONGS } from '../constants';
import { SongIndexState } from '../types';

export const fetchSongs = createFetchThunk<SongIndexState>(
    buildResourceFetchActionPrefix(SONGS),
    `${getApiResourcesBaseRoute()}/songs`,
    (
        serverResponse: IIndexQueryResult<WithTags<ISongViewModel>>
    ): IIndexQueryResult<WithTags<ISongViewModel>> => {
        const { apiUrl } = getConfig();

        return {
            ...serverResponse,
            entities: serverResponse.entities.map((entity) => {
                return {
                    ...entity,
                    audioURL: isNullOrUndefined(entity.audioURL)
                        ? undefined
                        : `${apiUrl}${entity.audioURL}`,
                };
            }),
        };
    }
);
