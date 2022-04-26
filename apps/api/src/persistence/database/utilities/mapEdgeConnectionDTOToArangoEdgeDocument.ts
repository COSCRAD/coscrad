import { EdgeConnection } from 'apps/api/src/domain/models/context/edge-connection.entity';
import { DTO } from 'apps/api/src/types/partial-dto';
import { ArangoEdgeDocument } from '../types/ArangoEdgeDocument';
import getArangoDocumentDirectionAttributesFromEdgeConnectionMembers from './getArangoDocumentDirectionAttributesFromEdgeConnectionMembers';
import mapEntityDTOToDatabaseDTO from './mapEntityDTOToDatabaseDTO';

export default (edgeConnection: DTO<EdgeConnection>): ArangoEdgeDocument =>
    mapEntityDTOToDatabaseDTO<Omit<ArangoEdgeDocument, '_key'> & { id: string }>({
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
