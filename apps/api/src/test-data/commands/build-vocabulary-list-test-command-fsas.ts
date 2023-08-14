import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    CREATE_VOCABULARY_LIST,
    CreateVocabularyList,
} from '../../domain/models/vocabulary-list/commands/create-vocabulary-list';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(101);

const type = AggregateType.vocabularyList;

const createVocabularyList: CommandFSA<CreateVocabularyList> = {
    type: CREATE_VOCABULARY_LIST,
    payload: {
        aggregateCompositeIdentifier: {
            type,
            id,
        },
        name: 'Verb Paradigm #1',
        languageCodeForName: LanguageCode.Chilcotin,
    },
};

export const buildVocabularyListTestCommandFsas = () => [createVocabularyList];
