import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateContributor } from '../../domain/models/user-management/contributor';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(68);

const type = AggregateType.contributor;

const createContributor: CommandFSA<CreateContributor> = {
    type: 'CREATE_CONTRIBUTOR',
    payload: {
        aggregateCompositeIdentifier: { id, type },
        firstName: 'Bob',
        lastName: 'Smith',
    },
};

export const buildContributorTestCommandFsas = () => [createContributor];
