import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddAudioForDigitalTextPage,
    AddAudioForDigitalTextTitle,
    AddCoverPhotographForDigitalText,
    AddPageToDigitalText,
    CreateDigitalText,
    ImportPagesToDigitalText,
    TranslateDigitalTextPageContent,
    TranslateDigitalTextTitle,
} from '../../domain/models/digital-text/commands';
import { AddContentToDigitalTextPage } from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { AddPhotographToDigitalTextPage } from '../../domain/models/digital-text/commands/add-photograph-to-digital-text-page';
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

const addAudioForDigitalTextTitle: CommandFSA<AddAudioForDigitalTextTitle> = {
    type: `ADD_AUDIO_FOR_DIGITAL_TEXT_TITLE`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        languageCode: LanguageCode.Chilcotin,
        audioItemId: buildDummyUuid(2),
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

const addAudioForDigitalTextPage: CommandFSA<AddAudioForDigitalTextPage> = {
    type: `ADD_AUDIO_FOR_DIGITAL_TEXT_PAGE`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        pageIdentifier: '127',
        languageCode: LanguageCode.English,
        audioItemId: buildDummyUuid(1),
    },
};

const addCoverPhotographForDigitalText: CommandFSA<AddCoverPhotographForDigitalText> = {
    type: `ADD_COVER_PHOTOGRAPH_FOR_DIGITAL_TEXT`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        photographId: buildDummyUuid(117),
    },
};

const addPhotographToDigitalTextPage: CommandFSA<AddPhotographToDigitalTextPage> = {
    type: `ADD_PHOTOGRAPH_TO_DIGITAL_TEXT_PAGE`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        pageIdentifier: '127',
        photographId: buildDummyUuid(44),
    },
};

const translateDigitalTextTitle: CommandFSA<TranslateDigitalTextTitle> = {
    type: `TRANSLATE_DIGITAL_TEXT_TITLE`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        translation: `translation of title`,
        languageCode: LanguageCode.Chilcotin,
    },
};

const importPagesToDigitalText: CommandFSA<ImportPagesToDigitalText> = {
    type: 'IMPORT_PAGES_TO_DIGITAL_TEXT',
    payload: {
        aggregateCompositeIdentifier: { id, type },
        pages: [
            {
                pageIdentifier: '1v',
                content: [
                    {
                        text: 'hello world',
                        languageCode: LanguageCode.Chilcotin,
                        isOriginalLanguage: true,
                    },
                ],
                photographId: buildDummyUuid(23),
            },
        ],
    },
};

export const buildDigitalTextCommandFsas = () => [
    createDigitalText,
    addPageToDigitalText,
    addContentToDigitalTextPage,
    addAudioForDigitalTextTitle,
    translateDigitalTextPageContent,
    addAudioForDigitalTextPage,
    addCoverPhotographForDigitalText,
    addPhotographToDigitalTextPage,
    translateDigitalTextTitle,
    importPagesToDigitalText,
];
