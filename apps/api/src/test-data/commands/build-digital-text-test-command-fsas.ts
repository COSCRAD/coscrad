import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AddPageToDigitalText, CreateDigitalText } from '../../domain/models/digital-text/commands';
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

export const buildDigitalTextCommandFsas = () => [createDigitalText, addPageToDigitalText];
