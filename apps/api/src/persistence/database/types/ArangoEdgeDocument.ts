import { EdgeConnectionContext } from '../../../domain/models/context/context.entity';
import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { BaseEvent } from '../../../domain/models/shared/events/base-event.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DTO } from '../../../types/DTO';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';

type ArangoEdgeMemberContext = {
    role: EdgeConnectionMemberRole;

    context: DTO<EdgeConnectionContext>;
};

type ArangoEdgeDocumentWithoutSystemAttributes = {
    type: typeof AggregateType.note;

    connectionType: EdgeConnectionType;

    note: string;

    members: ArangoEdgeMemberContext[];

    eventHistory: DTO<BaseEvent>[];
};

export type ArangoEdgeDocument =
    HasArangoDocumentDirectionAttributes<ArangoEdgeDocumentWithoutSystemAttributes> & {
        _key: string;
    };
