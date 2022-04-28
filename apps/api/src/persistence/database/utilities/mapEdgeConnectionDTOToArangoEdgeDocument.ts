import { EdgeConnection } from '../../../domain/models/context/edge-connection.entity';
import { DTO } from '../../../types/DTO';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import getArangoDocumentDirectionAttributesFromEdgeConnectionMembers from './getArangoDocumentDirectionAttributesFromEdgeConnectionMembers';
import mapEntityDTOToDatabaseDTO from './mapEntityDTOToDatabaseDTO';

export default (edgeConnection: DTO<EdgeConnection>): ArangoEdgeDocument => {
    console.log(`map EdgeConnectionDTO to ArangoEdgeDocument`);

    return mapEntityDTOToDatabaseDTO<Omit<ArangoEdgeDocument, '_key'> & { id: string }>({
        ...getArangoDocumentDirectionAttributesFromEdgeConnectionMembers(
            edgeConnection.members,
            edgeConnection.type
        ),
        ...edgeConnection,
        members: edgeConnection.members.map(({ role, context }) => ({
            role,
            context,
        })),
    });
};
