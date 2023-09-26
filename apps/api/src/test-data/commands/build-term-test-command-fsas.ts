import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { CreatePromptTerm, CreateTerm, TranslateTerm } from '../../domain/models/term/commands';
import { CREATE_PROMPT_TERM } from '../../domain/models/term/commands/create-prompt-term/constants';
import { CREATE_TERM } from '../../domain/models/term/commands/create-term/constants';
import { TRANSLATE_TERM } from '../../domain/models/term/commands/translate-term/constants';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(11);

const type = AggregateType.term;

const createTerm: CommandFSA<CreateTerm> = {
    type: CREATE_TERM,
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

const createPromptTerm: CommandFSA<CreatePromptTerm> = {
    type: CREATE_PROMPT_TERM,
    payload: {
        aggregateCompositeIdentifier: {
            id,
            type,
        },
        text: '(How do you say: ) elbow',
    },
};

const translateTerm: CommandFSA<TranslateTerm> = {
    type: TRANSLATE_TERM,
    payload: {
        aggregateCompositeIdentifier: {
            id,
            type,
        },
        translation: 'I am talking to him (English)',
        languageCode: LanguageCode.English,
    },
};

export const buildTermTestCommandFsas = () => [createTerm, translateTerm, createPromptTerm];
