import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { formatCitationInfromation } from './shared';
import { BibliographicReferenceJointViewModel } from './types';

export const BookBibliographicReferenceJointViewModel = ({
    id,
    data: { title, year, publisher, place, numberOfPages, isbn },
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): BibliographicReferenceJointViewModel => ({
    type: 'Book',
    id,
    title,
    citation: formatCitationInfromation(
        [publisher, place, numberOfPages.toString(), isbn],
        year.toString()
    ),
});
