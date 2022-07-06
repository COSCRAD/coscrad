import { EdgeConnection } from '../../../domain/models/context/edge-connection.entity';
import { DTO } from '../../../types/DTO';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import getArangoDocumentDirectionAttributesFromEdgeConnectionMembers from './getArangoDocumentDirectionAttributesFromEdgeConnectionMembers';
import mapEntityDTOToDatabaseDTO from './mapEntityDTOToDatabaseDTO';

export default (edgeConnection: DTO<EdgeConnection>): ArangoEdgeDocument =>
    mapEntityDTOToDatabaseDTO<Omit<ArangoEdgeDocument, '_key'> & { id: string }>({
        ...getArangoDocumentDirectionAttributesFromEdgeConnectionMembers(
            edgeConnection.members,
            edgeConnection.connectionType
        ),
        ...edgeConnection,
        members: edgeConnection.members.map(({ role, context }) => ({
            role,
            context,
        })),
        eventHistory: edgeConnection.eventHistory || [],
    });
