import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import isContextAllowedForGivenResourceType from '../../../models/allowedContexts/isContextAllowedForGivenResourceType';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    isEdgeConnectionType,
} from '../../../models/context/edge-connection.entity';
import { isResourceId } from '../../../types/ResourceId';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BothMembersInEdgeConnectionHaveSameRoleError from '../../errors/context/edgeConnections/BothMembersInEdgeConnectionHaveSameRoleError';
import ContextTypeIsNotAllowedForGivenResourceTypeError from '../../errors/context/edgeConnections/ContextTypeIsNotAllowedForGivenResourceTypeError';
import InvalidEdgeConnectionDTOError from '../../errors/context/edgeConnections/InvalidEdgeConnectionDTOError';
import InvalidEdgeConnectionIDError from '../../errors/context/edgeConnections/InvalidEdgeConnectionIDError';
import InvalidEdgeConnectionMemberRolesError from '../../errors/context/edgeConnections/InvalidEdgeConnectionMemberRolesError';
import InvalidEdgeConnectionTypeError from '../../errors/context/edgeConnections/InvalidEdgeConnectionTypeError';
import InvalidNumberOfMembersInEdgeConnectionError from '../../errors/context/edgeConnections/InvalidNumberOfMembersInEdgeConnectionError';
import NoteMissingFromEdgeConnectionError from '../../errors/context/edgeConnections/NoteMissingFromEdgeConnectionError';
import NullOrUndefinedEdgeConnectionDTOError from '../../errors/context/edgeConnections/NullOrUndefindEdgeConnectionDTOError';
import { Valid } from '../../Valid';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidEdgeConnectionDTOError(innerErrors);

/**
 * TODO: Should we call this validateEdgeConnection?
 */
export default (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input)) return new NullOrUndefinedEdgeConnectionDTOError();

    const test = input as PartialDTO<EdgeConnection>;

    const { note, type: edgeConnectionType, id } = test;

    const members = test.members as EdgeConnectionMember[];

    const allErrors: InternalError[] = [];

    if (isNullOrUndefined(note)) allErrors.push(new NoteMissingFromEdgeConnectionError());

    if (!isEdgeConnectionType(edgeConnectionType))
        allErrors.push(new InvalidEdgeConnectionTypeError(edgeConnectionType));

    // TODO Rename this to `isEntityId`
    if (!isResourceId(id)) allErrors.push(new InvalidEdgeConnectionIDError(id));

    // TODO Validate for members array is null or undefined

    // TODO Check that none of the members is null or undefined
    const numberOfMembers = members.length;

    // Validate edge connection type against number of members
    // We return early if there is the wrong number of members in the connection
    if (edgeConnectionType === EdgeConnectionType.self && numberOfMembers !== 1)
        return buildTopLevelError(
            allErrors.concat(
                new InvalidNumberOfMembersInEdgeConnectionError(edgeConnectionType, numberOfMembers)
            )
        );

    if (edgeConnectionType === EdgeConnectionType.dual && numberOfMembers !== 2)
        return buildTopLevelError(
            allErrors.concat(
                new InvalidNumberOfMembersInEdgeConnectionError(edgeConnectionType, numberOfMembers)
            )
        );

    // Validate edge connection type against member roles
    if (edgeConnectionType === EdgeConnectionType.self) {
        const membersWithInvalidMemberRoles = members.filter(
            ({ role }) => role !== EdgeConnectionMemberRole.self
        );

        if (membersWithInvalidMemberRoles.length > 0)
            allErrors.push(
                new InvalidEdgeConnectionMemberRolesError(
                    edgeConnectionType,
                    membersWithInvalidMemberRoles
                )
            );
    }

    if (edgeConnectionType === EdgeConnectionType.dual) {
        const membersWithInvalidMemberRoles = members.filter(
            ({ role }) => role === EdgeConnectionMemberRole.self
        );

        if (membersWithInvalidMemberRoles.length > 0) {
            allErrors.push(
                new InvalidEdgeConnectionMemberRolesError(
                    edgeConnectionType,
                    membersWithInvalidMemberRoles
                )
            );
        } else {
            const memberRoles = members.flatMap(({ role }) => role);

            /**
             * At this point, we have already confirmed that
             * - there are exactly 2 members
             * - every member has a role of either `to` or `from`
             * all that's left is to make sure the roles are distinct from one
             * another
             */
            if (memberRoles[0] === memberRoles[1])
                allErrors.push(new BothMembersInEdgeConnectionHaveSameRoleError(memberRoles[0]));
        }
    }

    // Validate that each member has a context type that is consistent with the resource type in the composite id
    const disallowedContextTypeErrors = members.reduce(
        (
            accumulatedErrors: InternalError[],
            { context: { type }, compositeIdentifier: { type: resourceType } }
        ) =>
            isContextAllowedForGivenResourceType(type, resourceType)
                ? accumulatedErrors
                : accumulatedErrors.concat(
                      new ContextTypeIsNotAllowedForGivenResourceTypeError(type, resourceType)
                  ),
        []
    );

    if (disallowedContextTypeErrors.length > 0) allErrors.push(...disallowedContextTypeErrors);

    /**
     * TODO [https://www.pivotaltracker.com/story/show/181939924]
     *
     *  Validate that the context model satisfies its own invariants -> defer to
     *  context model invariant validation layer
     *
     **/

    return allErrors.length > 0 ? buildTopLevelError(allErrors) : Valid;
};
