import { CoscradEvent } from '../../../../../common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateBookBibliographicCitation } from './create-book-bibliographic-citation.command';

export type BookBibliographicCitationCreatedPayload = CreateBookBibliographicCitation;

@CoscradEvent('BOOK_BIBLIOGRAPHIC_CITATION_CREATED')
export class BookBibliographicCitationCreated extends BaseEvent {
    type = 'BOOK_BIBLIOGRAPHIC_CITATION_CREATED';
}
