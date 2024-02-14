import { buildNoteAboutResourceCreated, buildResourcesConnectedWithNote } from './builders';

export const getNoteTestEventMap = () =>
    new Map()
        .set('NOTE_ABOUT_RESOURCE_CREATED', buildNoteAboutResourceCreated)
        .set('RESOURCES_CONNECTED_WITH_NOTE', buildResourcesConnectedWithNote);
