import {
    buildNoteAboutResourceCreated,
    buildNoteTranslatedAboutResource,
    buildResourcesConnectedWithNote,
} from './builders';

export const getNoteTestEventMap = () =>
    new Map()
        .set('NOTE_ABOUT_RESOURCE_CREATED', buildNoteAboutResourceCreated)
        .set('RESOURCES_CONNECTED_WITH_NOTE', buildResourcesConnectedWithNote)
        .set('NOTE_TRANSLATED_ABOUT_RESOURCE', buildNoteTranslatedAboutResource);
