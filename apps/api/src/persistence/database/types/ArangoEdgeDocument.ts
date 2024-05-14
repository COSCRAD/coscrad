import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { EdgeConnectionContext } from '../../../domain/models/context/context.entity';
import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { BaseEvent } from '../../../domain/models/shared/events/base-event.entity';
import { MultilingualAudio } from '../../../domain/models/shared/multilingual-audio/multilingual-audio.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DTO } from '../../../types/DTO';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';

type ArangoEdgeMemberContext = {
    role: EdgeConnectionMemberRole;

    context: DTO<EdgeConnectionContext>;
};

// TODO make this extensible!
type ArangoEdgeDocumentWithoutSystemAttributes = {
    type: typeof AggregateType.note;

    connectionType: EdgeConnectionType;

    note: DTO<MultilingualText>;

    audioForNote: DTO<MultilingualAudio>;

    members: ArangoEdgeMemberContext[];

    eventHistory: DTO<BaseEvent>[];
};

export type ArangoEdgeDocument =
    HasArangoDocumentDirectionAttributes<ArangoEdgeDocumentWithoutSystemAttributes> & {
        _key: string;
    };
