import { EdgeConnectionContextType } from 'apps/api/src/domain/models/context/types/EdgeConnectionContextType';
import { resourceTypes } from 'apps/api/src/domain/types/resourceTypes';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { DTO } from 'apps/api/src/types/DTO';
import formatResourceCompositeIdentifier from 'apps/api/src/view-models/presentation/formatResourceCompositeIdentifier';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import buildOneSelfEdgeConnectionForEachResourceType from '../buildSelfConnectionTestData/buildOneSelfEdgeConnectionForEachResourceType';
import buildOneDualEdgeConnectionForEveryContextType from './buildOneDualEdgeConnectionForEveryContextType';
import buildOneFromConnectionForInstanceOfEachResourceType from './buildOneFromConnectionForInstanceOfEachResourceType';
import buildOneToConnectionForInstanceOfEachResourceType from './buildOneToConnectionForInstanceOfEachResourceType';

const buildDummyNoteForDualConnection = (
    toMember: EdgeConnectionMember,
    fromMember: EdgeConnectionMember
): string =>
    [
        `That is why`,
        formatResourceCompositeIdentifier(toMember.compositeIdentifier),
        `is related to`,
        formatResourceCompositeIdentifier(fromMember.compositeIdentifier),
    ].join(' ');

const generateComprehensiveDualEdgeConnectionTestData = (): DTO<EdgeConnection>[] => {
    const validSelfMembers = buildOneSelfEdgeConnectionForEachResourceType()
        .flatMap(({ members }) => members)
        .filter(
            (member) =>
                /**
                 * TODO [https://www.pivotaltracker.com/story/show/181978898]
                 * Remove this first condition when we support a non-trivial
                 * context for a `SpatialFeature`
                 */
                member.compositeIdentifier.type == resourceTypes.spatialFeature ||
                member.context.type !== EdgeConnectionContextType.general
        );

    const oneToMemberOfEachResourceType = Object.values(resourceTypes)
        /**
         * TODO [https://www.pivotaltracker.com/story/show/181861405]
         *
         * Remove filter.
         */
        .filter((resourceType) => resourceType !== resourceTypes.tag)
        .reduce((allToMembers: EdgeConnectionMember[], resourceType) => {
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
        }, []);

    const oneFromMemberOfEachResourceType = oneToMemberOfEachResourceType.map((toMember) => ({
        ...toMember,
        role: EdgeConnectionMemberRole.from,
    }));

    const edgeConnections = oneToMemberOfEachResourceType.map((toMember, index) => {
        const fromMember =
            oneFromMemberOfEachResourceType[(index + 1) % oneToMemberOfEachResourceType.length];

        return {
            type: EdgeConnectionType.dual,
            // TODO generate this at the top level instead
            id: `${2000 + index}`,
            members: [toMember, fromMember],
            note: buildDummyNoteForDualConnection(toMember, fromMember),
            tagIDs: [],
        };
    });

    return edgeConnections;
};

export default (): DTO<EdgeConnection>[] => [
    ...generateComprehensiveDualEdgeConnectionTestData(),
    ...buildOneDualEdgeConnectionForEveryContextType(),
    ...buildOneFromConnectionForInstanceOfEachResourceType(),
    ...buildOneToConnectionForInstanceOfEachResourceType(),
];
