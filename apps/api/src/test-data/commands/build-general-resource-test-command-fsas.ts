import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { PublishResource } from '../../domain/models/shared/common-commands';
import { GrantResourceReadAccessToUser } from '../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command';
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
    type: `GRANT_RESOURCE_READ_ACCESS_TO_USER`,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id,
        },
        userId: buildDummyUuid(123),
    },
};

export const buildGeneralResourceTestCommandFsas = () => [
    publishResource,
    grantResourceReadAccessToUser,
];
