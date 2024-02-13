import { buildNoteAboutResourceCreated } from './builders';

export const getNoteTestEventMap = () =>
    new Map().set('NOTE_ABOUT_RESOURCE_CREATED', buildNoteAboutResourceCreated);
