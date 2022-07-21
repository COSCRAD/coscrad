import { InternalError } from '../../../../../lib/errors/InternalError';
import { EdgeConnectionType } from '../../../../models/context/edge-connection.entity';

export default class InvalidNumberOfMembersInEdgeConnectionError extends InternalError {
    constructor(edgeConnectionType: EdgeConnectionType, numberOfMembers) {
        super(
            `Invalid number: ${numberOfMembers} of members in edge connection of type: ${edgeConnectionType}`
        );
    }
}
