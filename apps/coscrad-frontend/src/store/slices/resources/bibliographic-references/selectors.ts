import { RootState } from '../../..';

export const selectLoadableBibliographicReferences = (state: RootState) =>
    state.bibliographicReference;
