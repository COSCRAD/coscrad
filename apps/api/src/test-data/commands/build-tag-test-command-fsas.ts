import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateTag, TagResourceOrNote } from '../../domain/models/tag/commands';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(201);

const type = AggregateType.tag;

const createTag: CommandFSA<CreateTag> = {
    type: `CREATE_TAG`,
    payload: {
        aggregateCompositeIdentifier: {
            type,
            id,
        },
        label: `animals`,
    },
};

const tagResourceOrNote: CommandFSA<TagResourceOrNote> = {
    type: `TAG_RESOURCE_OR_NOTE`,
    payload: {
        aggregateCompositeIdentifier: {
            type,
            id,
        },
        taggedMemberCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(11),
        },
    },
};

export const buildTagTestCommandFsas = () => [createTag, tagResourceOrNote];
