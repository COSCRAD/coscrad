import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    GRANT_RESOURCE_READ_ACCESS_TO_USER,
    GrantResourceReadAccessToUser,
    PublishResource,
    UnpublishResource,
} from '../../domain/models/shared/common-commands';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(5555);

const publishResource: CommandFSA<PublishResource> = {
    type: `PUBLISH_RESOURCE`,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id,
        },
    },
};

const grantResourceReadAccessToUser: CommandFSA<GrantResourceReadAccessToUser> = {
    type: GRANT_RESOURCE_READ_ACCESS_TO_USER,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id,
        },
        userId: buildDummyUuid(123),
    },
};

const unpublishResource: CommandFSA<UnpublishResource> = {
    type: 'UNPUBLISH_RESOURCE',
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id,
        },
    },
};

export const buildGeneralResourceTestCommandFsas = () => [
    publishResource,
    grantResourceReadAccessToUser,
    unpublishResource,
];
