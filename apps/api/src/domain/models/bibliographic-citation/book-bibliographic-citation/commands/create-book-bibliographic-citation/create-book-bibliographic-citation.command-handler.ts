import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../../../factories/get-instance-factory-for-resource';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../../shared/functional';
import BibliographicCitationCreator from '../../../common/bibliographic-citation-creator.entity';
import { BibliographicCitationType } from '../../../types/bibliographic-citation-type';
import { BookBibliographicCitation } from '../../entities/book-bibliographic-citation.entity';
import { BookBibliographicCitationCreated } from './book-bibliographic-citation-created.event';
import { CreateBookBibliographicCitation } from './create-book-bibliographic-citation.command';

@CommandHandler(CreateBookBibliographicCitation)
export class CreateBookBibliographicCitationCommandHandler extends BaseCreateCommandHandler<BookBibliographicCitation> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        title,
        creators,
        abstract,
        year,
        publisher,
        place,
        url,
        numberOfPages,
        isbn,
    }: CreateBookBibliographicCitation): ResultOrError<BookBibliographicCitation> {
        const bookBibliographicCitationDto: DTO<BookBibliographicCitation> = {
            id,
            type: ResourceType.bibliographicCitation,
            // A separate `publish` command must be executed
            // TODO [https://www.pivotaltracker.com/story/show/183227484] add this command
            published: false,
            data: {
                type: BibliographicCitationType.book,
                title,
                creators: creators.map((creator) =>
                    new BibliographicCitationCreator(creator).toDTO()
                ),
                abstract,
                year,
                publisher,
                place,
                url,
                numberOfPages,
                isbn,
            },
        };

        return getInstanceFactoryForResource<BookBibliographicCitation>(
            ResourceType.bibliographicCitation
        )(bookBibliographicCitationDto);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource<BookBibliographicCitation>(ResourceType.bibliographicCitation)
            .fetchMany();

        // Do we really need to filter here?
        const preExistingBookBibliographicCitations = searchResult
            .filter(validAggregateOrThrow)
            .filter(({ data: { type } }) => type === BibliographicCitationType.book);

        return new DeluxeInMemoryStore({
            [AggregateType.bibliographicCitation]: preExistingBookBibliographicCitations,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        externalState: InMemorySnapshot,
        instance: BookBibliographicCitation
    ): InternalError | Valid {
        return instance.validateExternalState(externalState);
    }

    protected buildEvent(
        command: CreateBookBibliographicCitation,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new BookBibliographicCitationCreated(command, eventMeta);
    }
}
