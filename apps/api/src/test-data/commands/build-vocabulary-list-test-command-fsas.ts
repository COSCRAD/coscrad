import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddTermToVocabularyList,
    TranslateVocabularyListName,
} from '../../domain/models/vocabulary-list/commands';
import { ADD_TERM_TO_VOCABULARY_LIST } from '../../domain/models/vocabulary-list/commands/add-term-to-vocabulary-list/constants';
import {
    CREATE_VOCABULARY_LIST,
    CreateVocabularyList,
} from '../../domain/models/vocabulary-list/commands/create-vocabulary-list';
import { TRANSLATE_VOCABULARY_LIST_NAME } from '../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/constants';
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

const translateVocabularyListName: CommandFSA<TranslateVocabularyListName> = {
    type: TRANSLATE_VOCABULARY_LIST_NAME,
    payload: {
        aggregateCompositeIdentifier: {
            type,
            id,
        },
        languageCode: LanguageCode.English,
        text: 'translation of dummy vocabulary list name into English',
    },
};

const addTermToVocabularyList: CommandFSA<AddTermToVocabularyList> = {
    type: ADD_TERM_TO_VOCABULARY_LIST,
    payload: {
        aggregateCompositeIdentifier: {
            type,
            id,
        },
        termId: buildDummyUuid(777),
    },
};

export const buildVocabularyListTestCommandFsas = () => [
    createVocabularyList,
    translateVocabularyListName,
    addTermToVocabularyList,
];
