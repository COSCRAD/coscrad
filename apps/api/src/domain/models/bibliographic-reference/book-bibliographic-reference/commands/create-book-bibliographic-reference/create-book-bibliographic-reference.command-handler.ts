import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../../../factories/getInstanceFactoryForResource';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../../shared/functional';
import BibliographicReferenceCreator from '../../../common/bibliographic-reference-creator.entity';
import { BibliographicReferenceType } from '../../../types/BibliographicReferenceType';
import { BookBibliographicReference } from '../../entities/book-bibliographic-reference.entity';
import { BookBibliographicReferenceCreated } from './book-bibliographic-reference-created.event';
import { CreateBookBibliographicReference } from './create-book-bibliographic-reference.command';

@CommandHandler(CreateBookBibliographicReference)
export class CreateBookBibliographicReferenceCommandHandler extends BaseCreateCommandHandler<BookBibliographicReference> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<BookBibliographicReference>;

    aggregateType = AggregateType.bibliographicReference;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource(
            ResourceType.bibliographicReference
        );
    }

    protected createNewInstance({
        id,
        title,
        creators,
        abstract,
        year,
        publisher,
        place,
        url,
        numberOfPages,
        isbn,
    }: CreateBookBibliographicReference): ResultOrError<BookBibliographicReference> {
        const bookBibliographicReferenceDto: DTO<BookBibliographicReference> = {
            id,
            type: ResourceType.bibliographicReference,
            // A separate `publish` command must be executed
            published: false,
            data: {
                type: BibliographicReferenceType.book,
                title,
                creators: creators.map((creator) =>
                    new BibliographicReferenceCreator(creator).toDTO()
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

        return getInstanceFactoryForResource<BookBibliographicReference>(
            ResourceType.bibliographicReference
        )(bookBibliographicReferenceDto);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource<BookBibliographicReference>(ResourceType.bibliographicReference)
            .fetchMany();

        const preExistingBookBibliographicReferences = searchResult
            .filter(validAggregateOrThrow)
            .filter(({ data: { type } }) => type === BibliographicReferenceType.book);

        return buildInMemorySnapshot({
            resources: {
                bibliographicReference: preExistingBookBibliographicReferences,
            },
        });
    }

    protected validateExternalState(
        externalState: InMemorySnapshot,
        instance: BookBibliographicReference
    ): InternalError | Valid {
        return instance.validateExternalState(externalState);
    }

    protected buildEvent(
        command: CreateBookBibliographicReference,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new BookBibliographicReferenceCreated(command, eventId, userId);
    }
}
