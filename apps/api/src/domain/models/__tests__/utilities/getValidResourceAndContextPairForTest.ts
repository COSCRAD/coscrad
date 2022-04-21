import { InternalError } from '../../../../lib/errors/InternalError';
import buildTestData from '../../../../test-data/buildTestData';
import formatResourceCompositeIdentifier from '../../../../view-models/presentation/formatResourceCompositeIdentifier';
import { ContextTypeToInstance } from '../../../models/context/types/ContextTypeToInstance';
import { ResourceType, ResourceTypeToInstance } from '../../../types/resourceTypes';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { Resource } from '../../resource.entity';

/**
 * TODO: Dissect this TypeScript magic on the `pro-d` channel on slack
 */
export default <
    TResourceType extends ResourceType,
    UEdgeConnectionContextType extends EdgeConnectionContextType
>(
    targetResourceType: TResourceType,
    targetContextType: UEdgeConnectionContextType
): [ResourceTypeToInstance[TResourceType], ContextTypeToInstance[UEdgeConnectionContextType]] => {
    const { resources, connections } = buildTestData();

    const allMembers = connections.flatMap(({ members }) => members);

    const targetMember = allMembers.find(
        ({
            compositeIdentifier: { type: memberResourceType },
            context: { type: memberContextType },
        }) => targetResourceType === memberResourceType && targetContextType === memberContextType
    );

    // This shouldn't happen as `validateTestData.spec.ts` forces us to seed data comprehensively
    if (isNullOrUndefined(targetMember))
        throw new InternalError(
            [
                `Failed to find test data for edge connection member with`,
                `context type: ${targetContextType}`,
                `and resource type: ${targetResourceType}`,
            ].join(' ')
        );

    const {
        compositeIdentifier: { id: targetMemberId },
        context: targetContext,
    } = targetMember;

    const targetResource = (resources[targetResourceType] as Resource[]).find(
        ({ id }: Resource) => id === targetMemberId
    );

    // This shouldn't happen as `validateTestData.spec.ts` forces us to seed data with consistent state
    if (isNullOrUndefined(targetResource)) {
        console.log({
            [targetResourceType]: resources[targetResourceType],
        });

        throw new InternalError(
            `There is no resource in the test data with composite id: ${formatResourceCompositeIdentifier(
                targetMember.compositeIdentifier
            )}`
        );
    }

    return [targetResource, targetContext] as [
        ResourceTypeToInstance[TResourceType],
        ContextTypeToInstance[UEdgeConnectionContextType]
    ];
};
