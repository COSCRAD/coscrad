import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { BibliographicReferenceJointViewModel } from './types';

export const BookBibliographicReferenceJointViewModel = ({
    id,
    data: { title, year, publisher, place, numberOfPages, isbn },
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): BibliographicReferenceJointViewModel => ({
    type: 'Book',
    id,
    title,
    citation: `${[publisher, place, numberOfPages, isbn]
        .filter((value) => value !== null && typeof value !== undefined)
        .join(',')} (${year})`,
});
