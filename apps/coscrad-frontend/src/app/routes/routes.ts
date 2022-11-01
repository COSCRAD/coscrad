import { ResourceType } from '@coscrad/api-interfaces';
import { getResourceTypeLabelForRoutes } from './get-resource-type-label-for-routes';
import { IndexAndDetailSubrouteBuilder } from './index-and-detail-subroute-builder';

const resourcesBaseRoute = `Resources`;

export const routes = {
    home: '/',
    about: 'About',
    membersOnly: 'MembersOnly',
    notes: IndexAndDetailSubrouteBuilder('Notes'),
    tags: IndexAndDetailSubrouteBuilder('Tags'),
    treeOfKnowledge: 'TreeOfKnowledge',
    resources: {
        info: resourcesBaseRoute,
        ofType: (resourceType: ResourceType) =>
            IndexAndDetailSubrouteBuilder(
                `${resourcesBaseRoute}/${getResourceTypeLabelForRoutes(resourceType)}`
            ),
    },
};
