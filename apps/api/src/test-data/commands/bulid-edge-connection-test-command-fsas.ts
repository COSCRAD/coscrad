import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddAudioForNote,
    CREATE_NOTE_ABOUT_RESOURCE,
    ConnectResourcesWithNote,
    CreateNoteAboutResource,
    TranslateNote,
} from '../../domain/models/context/commands';
import { CONNECT_RESOURCES_WITH_NOTE } from '../../domain/models/context/commands/connect-resources-with-note/constants';
import { EdgeConnectionContextType } from '../../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../../domain/types/AggregateType';

const aggregateCompositeIdentifier = {
    type: AggregateType.note,
    id: buildDummyUuid(1001),
};

const songAggregateCompositeIdentifier = {
    type: AggregateType.song,
    id: buildDummyUuid(1),
};

const createNoteAboutResource: CommandFSA<CreateNoteAboutResource> = {
    type: CREATE_NOTE_ABOUT_RESOURCE,
    payload: {
        aggregateCompositeIdentifier,
        resourceCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(1),
        },
        resourceContext: {
            type: EdgeConnectionContextType.general,
        },
        text: `This is an amazing song`,
        languageCode: LanguageCode.Chilcotin,
    },
};

const connectResourcesWithNote: CommandFSA<ConnectResourcesWithNote> = {
    type: CONNECT_RESOURCES_WITH_NOTE,
    payload: {
        aggregateCompositeIdentifier,
        fromMemberCompositeIdentifier: songAggregateCompositeIdentifier,
        fromMemberContext: {
            type: EdgeConnectionContextType.general,
        },
        toMemberCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(11),
        },
        toMemberContext: {
            type: EdgeConnectionContextType.general,
        },
        text: `this song contains the connected term`,
        languageCode: LanguageCode.Haida,
    },
};

const translateNote: CommandFSA<TranslateNote> = {
    type: 'TRANSLATE_NOTE',
    payload: {
        aggregateCompositeIdentifier,
        text: 'this contains the translated note',
        languageCode: LanguageCode.Chinook,
    },
};

const addaudioForNote: CommandFSA<AddAudioForNote> = {
    type: 'ADD_AUDIO_FOR_NOTE',
    payload: {
        aggregateCompositeIdentifier,
        audioItemId: buildDummyUuid(12),
        languageCode: LanguageCode.English,
    },
};

export const buildEdgeConnectionTestCommandFsas = () => [
    createNoteAboutResource,
    connectResourcesWithNote,
    translateNote,
    addaudioForNote,
];
