import { IIndexQueryResult, IVideoViewModel, WithTags } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { getConfig } from '../../../../config';
import { buildResourceFetchActionPrefix } from '../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../shared';
import { VIDEOS } from './constants';
import { VideoIndexState } from './types';

export const fetchVideos = createFetchThunk<VideoIndexState>(
    buildResourceFetchActionPrefix(VIDEOS),
    `${getApiResourcesBaseRoute()}/videos`,
    (
        serverResponse: IIndexQueryResult<WithTags<IVideoViewModel>>
    ): IIndexQueryResult<WithTags<IVideoViewModel>> => {
        const { apiUrl } = getConfig();

        return {
            ...serverResponse,
            entities: serverResponse.entities.map((entity) => {
                return {
                    ...entity,
                    videoUrl: isNullOrUndefined(entity.videoUrl)
                        ? undefined
                        : `${apiUrl}${entity.videoUrl}`,
                };
            }),
        };
    }
);
