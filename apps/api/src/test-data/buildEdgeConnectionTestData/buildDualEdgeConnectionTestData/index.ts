import { getResourceTypesThatOnlySupportGeneralContext } from '../../../domain/models/allowedContexts/isContextAllowedForGivenResourceType';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { ResourceType } from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import formatResourceCompositeIdentifier from '../../../view-models/presentation/formatAggregateCompositeIdentifier';
import buildOneSelfEdgeConnectionForEachResourceType from '../buildSelfConnectionTestData/buildOneSelfEdgeConnectionForEachResourceType';
import buildOneDualEdgeConnectionForEveryContextType from './buildOneDualEdgeConnectionForEveryContextType';
import buildOneFromConnectionForInstanceOfEachResourceType from './buildOneFromConnectionForInstanceOfEachResourceType';
import buildOneToConnectionForInstanceOfEachResourceType from './buildOneToConnectionForInstanceOfEachResourceType';

const buildDummyNoteForDualConnection = (
    toMember: DTO<EdgeConnectionMember>,
    fromMember: DTO<EdgeConnectionMember>
): string =>
    [
        `That is why`,
        formatResourceCompositeIdentifier(toMember.compositeIdentifier),
        `is related to`,
        formatResourceCompositeIdentifier(fromMember.compositeIdentifier),
    ].join(' ');

const resourceTypesThatCurrentlyOnlySupportGeneralContext =
    getResourceTypesThatOnlySupportGeneralContext();

const generateComprehensiveDualEdgeConnectionTestData = (
    uniqueIdOffset: number,
    resourceTypesThatHaveBeenManuallyGenerated: ResourceType[]
): EdgeConnection[] => {
    const validSelfMembers = buildOneSelfEdgeConnectionForEachResourceType(uniqueIdOffset)
        .flatMap(({ members }) => members)
        .filter(
            (member) =>
                /**
                 * TODO [https://www.pivotaltracker.com/story/show/181978898]
                 * Remove this first condition when we support a non-trivial
                 * context for a `SpatialFeature`.
                 *
                 * TODO [https://www.pivotaltracker.com/story/show/182204403]
                 * Determine context types for bibliographic reference models.
                 */
                resourceTypesThatCurrentlyOnlySupportGeneralContext.includes(
                    member.compositeIdentifier.type
                ) || member.context.type !== EdgeConnectionContextType.general
        );

    const resourceTypesRequiringDataGeneration = Object.values(ResourceType).filter(
        (resourceType) => !resourceTypesThatHaveBeenManuallyGenerated.includes(resourceType)
    );

    const oneToMemberOfEachResourceType = resourceTypesRequiringDataGeneration.reduce(
        (allToMembers: EdgeConnectionMember[], resourceType) => {
            const firstSelfMemberOfGivenType = validSelfMembers.find(
                ({ compositeIdentifier: { type } }) => type === resourceType
            );

            if (!firstSelfMemberOfGivenType) {
                throw new InternalError(`Failed to find a self member of type ${resourceType}`);
            }

            const result = allToMembers.concat({
                ...firstSelfMemberOfGivenType,
                role: EdgeConnectionMemberRole.to,
                // TODO remove cast
            } as EdgeConnectionMember);

            return result;
        },
        []
    );

    const oneFromMemberOfEachResourceType = oneToMemberOfEachResourceType.map((toMember) => ({
        ...toMember,
        role: EdgeConnectionMemberRole.from,
    }));

    const edgeConnectionDTOs = oneToMemberOfEachResourceType.map((toMember, index) => {
        const fromMember =
            oneFromMemberOfEachResourceType[(index + 1) % oneToMemberOfEachResourceType.length];

        return {
            type: AggregateType.note,
            connectionType: EdgeConnectionType.dual,
            // TODO generate this at the top level instead
            id: `${2000 + index}`,
            members: [toMember, fromMember],
            note: buildDummyNoteForDualConnection(toMember, fromMember),
        };
    });

    return edgeConnectionDTOs.map((dto) => new EdgeConnection(dto));
};

export default (uniqueIdOffset: number): EdgeConnection[] => [
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182302542]
     * "Strangle out" auto generation of test data.
     */
    ...generateComprehensiveDualEdgeConnectionTestData(uniqueIdOffset, [
        ResourceType.mediaItem,
        ResourceType.bibliographicReference,
    ]),
    ...buildOneDualEdgeConnectionForEveryContextType(),
    ...buildOneFromConnectionForInstanceOfEachResourceType(),
    ...buildOneToConnectionForInstanceOfEachResourceType(),
];
