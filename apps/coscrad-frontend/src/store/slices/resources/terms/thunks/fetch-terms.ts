import { IIndexQueryResult, ITermViewModel, WithTags } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from 'util';
import { getConfig } from '../../../../../config';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';
import { TermIndexState } from '../types/term-index-state';

export const fetchTerms = createFetchThunk<TermIndexState>(
    buildResourceFetchActionPrefix(TERMS),
    `${getApiResourcesBaseRoute()}/terms`,
    (
        serverResponse: IIndexQueryResult<WithTags<ITermViewModel>>
    ): IIndexQueryResult<WithTags<ITermViewModel>> => {
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
