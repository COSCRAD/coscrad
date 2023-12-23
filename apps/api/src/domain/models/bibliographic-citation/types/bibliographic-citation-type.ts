import { BibliographicCitationType } from '@coscrad/api-interfaces';

export { BibliographicCitationType };

export const isBibliographicCitationType = (input: unknown): input is BibliographicCitationType =>
    Object.values(BibliographicCitationType).includes(input as BibliographicCitationType);
