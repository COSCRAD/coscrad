import {
    BibliographicCitationType,
    IBibliographicCitationViewModel,
    IBookBibliographicCitationData,
} from '@coscrad/api-interfaces';
import { formatCitationInformation } from './shared';
import { BibliographicCitationJointViewModel } from './types';

export const BookBibliographicCitationJointViewModel = ({
    id,
    data: { title, year, publisher, place, numberOfPages, isbn },
}: IBibliographicCitationViewModel<IBookBibliographicCitationData>): BibliographicCitationJointViewModel => ({
    type: BibliographicCitationType.book,
    id,
    title,
    citation: formatCitationInformation(
        [publisher, place, numberOfPages?.toString(), isbn],
        year?.toString()
    ),
});
