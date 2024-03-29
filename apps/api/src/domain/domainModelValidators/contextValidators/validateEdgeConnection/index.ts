import { InternalError } from '../../../../lib/errors/InternalError';
import isContextAllowedForGivenResourceType from '../../../models/allowedContexts/isContextAllowedForGivenResourceType';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../models/context/edge-connection.entity';
import BothMembersInEdgeConnectionHaveSameRoleError from '../../errors/context/edgeConnections/BothMembersInEdgeConnectionHaveSameRoleError';
import ContextTypeIsNotAllowedForGivenResourceTypeError from '../../errors/context/edgeConnections/ContextTypeIsNotAllowedForGivenResourceTypeError';
import InvalidEdgeConnectionMemberRolesError from '../../errors/context/edgeConnections/InvalidEdgeConnectionMemberRolesError';
import InvalidNumberOfMembersInEdgeConnectionError from '../../errors/context/edgeConnections/InvalidNumberOfMembersInEdgeConnectionError';
import { isValid } from '../../Valid';
import validateContextModelInvariants from '../validateContextModelInvariants';

export default (input: unknown): InternalError[] => {
    /**
     * TODO cast to `DTO<EdgeConnection>`. Why does that type have trouble resolving
     * the type of the `members` property?
     */
    const test = input as EdgeConnection;

    const { connectionType: edgeConnectionType, members } = test;

    const allErrors: InternalError[] = [];

    // TODO Validate members array is not null or undefined (part of type checks)
    const numberOfMembers = members.length;

    // Validate edge connection type against number of members
    // We return early if there is the wrong number of members in the connection
    if (edgeConnectionType === EdgeConnectionType.self && numberOfMembers !== 1)
        return allErrors.concat(
            new InvalidNumberOfMembersInEdgeConnectionError(edgeConnectionType, numberOfMembers)
        );

    if (edgeConnectionType === EdgeConnectionType.dual && numberOfMembers !== 2)
        return allErrors.concat(
            new InvalidNumberOfMembersInEdgeConnectionError(edgeConnectionType, numberOfMembers)
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
        ) => {
            const isAllowed = isContextAllowedForGivenResourceType(type, resourceType);

            if (isAllowed) return accumulatedErrors;

            return accumulatedErrors.concat(
                new ContextTypeIsNotAllowedForGivenResourceTypeError(type, resourceType)
            );
        },
        []
    );

    if (disallowedContextTypeErrors.length > 0) allErrors.push(...disallowedContextTypeErrors);

    /**
     *  Here we validate that the context model invariant validation rules are
     * satisfied. We defer to the context model invariant validators for this.
     *
     **/
    const contextModelInvariantErrors = members.reduce(
        (accumulatedErrors: InternalError[], { context }) => {
            // Consider putting a `validateInvariants` on context models as well
            const validationResult = validateContextModelInvariants(context);

            return isValid(validationResult)
                ? accumulatedErrors
                : accumulatedErrors.concat(validationResult);
        },
        []
    );

    if (contextModelInvariantErrors.length > 0) allErrors.push(...contextModelInvariantErrors);

    return allErrors;
};
