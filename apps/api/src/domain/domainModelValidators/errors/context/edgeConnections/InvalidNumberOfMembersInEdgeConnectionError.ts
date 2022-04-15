import { EdgeConnectionType } from 'apps/api/src/domain/models/context/edge-connection.entity';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidNumberOfMembersInEdgeConnectionError extends InternalError {
    constructor(edgeConnectionType: EdgeConnectionType, numberOfMembers) {
        super(
            `Invalid number: ${numberOfMembers} of members in edge connection of type: ${edgeConnectionType}`
        );
    }
}
