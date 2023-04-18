import { getResourceTypesThatOnlySupportGeneralContext } from '../../../domain/models/allowedContexts/isContextAllowedForGivenResourceType';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
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

/**
 * Load connections for bibliographic references to be able to view the thumbnail
 * presenters on the frontend
 */
const additionalDualConnectionsForBibliographicReferenceDTOs = [
    {
        type: AggregateType.note,
        connectionType: EdgeConnectionType.dual,
        // TODO generate this at the top level instead
        id: `3201`,
        members: [
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    id: '3',
                    type: ResourceType.bibliographicReference,
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    id: '24',
                    type: ResourceType.book,
                },
                context: new GeneralContext(),
            },
        ],
        note: 'this is why bibliographic_references/3 is connected to book/24',
    },
    {
        type: AggregateType.note,
        connectionType: EdgeConnectionType.dual,
        // TODO generate this at the top level instead
        id: `3202`,
        members: [
            {
                role: EdgeConnectionMemberRole.from,
                compositeIdentifier: {
                    id: '23',
                    type: ResourceType.bibliographicReference,
                },
                context: new GeneralContext(),
            },
            {
                role: EdgeConnectionMemberRole.to,
                compositeIdentifier: {
                    id: '24',
                    type: ResourceType.book,
                },
                context: new GeneralContext(),
            },
        ],
        note: 'this is why bibliographic_references/23 is connected to book/24',
    },
];

const additionalDualConnectionsForBibliographicReferences: EdgeConnection[] =
    additionalDualConnectionsForBibliographicReferenceDTOs.map((dto) => new EdgeConnection(dto));

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
    ...additionalDualConnectionsForBibliographicReferences,
];
