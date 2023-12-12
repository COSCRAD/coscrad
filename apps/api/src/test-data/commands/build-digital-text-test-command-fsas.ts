import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddPageToDigitalText,
    CreateDigitalText,
    TranslateDigitalTextPageContent,
} from '../../domain/models/digital-text/commands';
import { AddContentToDigitalTextPage } from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import {
    ADD_PAGE_TO_DIGITAL_TEXT,
    CREATE_DIGITAL_TEXT,
} from '../../domain/models/digital-text/constants';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(67);

const type = AggregateType.digitalText;

const createDigitalText: CommandFSA<CreateDigitalText> = {
    type: CREATE_DIGITAL_TEXT,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        title: 'test-digital-text-name (language)',
        languageCodeForTitle: LanguageCode.English,
    },
};

const addPageToDigitalText: CommandFSA<AddPageToDigitalText> = {
    type: ADD_PAGE_TO_DIGITAL_TEXT,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        identifier: '21',
    },
};

const addContentToDigitalTextPage: CommandFSA<AddContentToDigitalTextPage> = {
    type: 'ADD_CONTENT_TO_DIGITAL_TEXT_PAGE',
    payload: {
        aggregateCompositeIdentifier: { id, type },
        pageIdentifier: '21',
        languageCode: LanguageCode.English,
        text: 'Twas many and many a year ago...',
    },
};

const translateDigitalTextPageContent: CommandFSA<TranslateDigitalTextPageContent> = {
    type: `TRANSLATE_DIGITAL_TEXT_PAGE_CONTENT`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        pageIdentifier: '117',
        languageCode: LanguageCode.Chilcotin,
        translation: 'the trainstation',
    },
};

export const buildDigitalTextCommandFsas = () => [
    createDigitalText,
    addPageToDigitalText,
    addContentToDigitalTextPage,
    translateDigitalTextPageContent,
];
