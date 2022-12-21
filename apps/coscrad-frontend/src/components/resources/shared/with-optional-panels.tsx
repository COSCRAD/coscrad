import { CoscradUserRole } from '../../../../../../libs/api-interfaces/src';
import { ConfigurableContent } from '../../../configurable-front-matter/data/configurableContentSchema';
import { WithCommands } from './with-commands';
import { WithWebOfKnowledge } from './with-web-of-knowledge';

export const WithOptionalPanels = (
    { shouldEnableWebOfKnowledgeForResources }: ConfigurableContent,
    userRoles: CoscradUserRole
) => {
    (
        [
            [
                WithCommands,
                userRoles.includes(CoscradUserRole.projectAdmin) ||
                    userRoles.includes(CoscradUserRole.superAdmin),
            ],
            [WithWebOfKnowledge, shouldEnableWebOfKnowledgeForResources],
        ] as const
    ).reduce(
        (PartiallyDecoratedComponent, [NextDecorator, predicate]) => PartiallyDecoratedComponent,

        AggregateDetailContainer
    );
};
