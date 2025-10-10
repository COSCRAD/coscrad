import { CategorizableType, IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { getConfig } from '../../../../../config';
import { getConfigurableContent } from '../../../../../configurable-front-matter';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';

export const fetchTerms = createFetchThunk<IIndexQueryResult<ITermViewModel>>(
    buildResourceFetchActionPrefix(TERMS),
    `${getApiResourcesBaseRoute()}/terms`,
    (serverResponse: IIndexQueryResult<ITermViewModel>): IIndexQueryResult<ITermViewModel> => {
        const { apiUrl } = getConfig();

        const { indexToDetailFlows } = getConfigurableContent();

        const termIndexToDetailFlowConfig = indexToDetailFlows.find(
            ({ categorizableType }) => categorizableType === CategorizableType.term
        );

        const identityFilter = (x: unknown) => x;

        const preFilter = termIndexToDetailFlowConfig?.indexFilter || identityFilter;

        /**
         * TODO Phase the following mapping layer out in favour
         * of doing this work on the server.
         */
        return {
            ...serverResponse,
            entities: serverResponse.entities.flatMap((entity) => {
                const doesEntityPassFilter = preFilter(entity);

                if (!doesEntityPassFilter) {
                    console.log(`I failed to pass the filter: ${entity}`);
                }

                return doesEntityPassFilter
                    ? [
                          {
                              ...entity,
                              audioURL: isNullOrUndefined(entity.audioURL)
                                  ? undefined
                                  : `${apiUrl}${entity.audioURL}`,
                          },
                      ]
                    : [];
            }),
        };
    }
);
