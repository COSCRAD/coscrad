import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateTerm } from '../../domain/models/term/commands';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(11);

const type = AggregateType.term;

const createTerm: CommandFSA<CreateTerm> = {
    type: 'CREATE_TERM',
    payload: {
        aggregateCompositeIdentifier: {
            id,
            type,
        },
        text: 'I am talking to him (language)',
        languageCode: LanguageCode.Chilcotin,
        contributorId: `1`,
    },
};

export const buildTermTestCommandFsas = () => [createTerm];
