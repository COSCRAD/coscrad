import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { RepositoryProvider } from '../../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import getInstanceFactoryForResource from '../../../../factories/getInstanceFactoryForResource';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { ResourceType } from '../../../../types/ResourceType';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { BaseCreateBibliographicReference } from '../../common/commands/base-create-bibliographic-reference.command-handler';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';
import { JournalArticleBibliographicReference } from '../entities/journal-article-bibliographic-reference.entity';
import { CreateJournalArticleBibliographicReference } from './create-journal-article-bibliographic-reference.command';
import { JournalArticleBibliographicReferenceCreated } from './journal-article-bibliographic-reference-created.event';

// TODO Remove the overlap between this and other `CREATE_BIBLIOGRAPHIC_REFERENCE` commands
@CommandHandler(CreateJournalArticleBibliographicReference)
export class CreateJournalArticleBibliographicReferenceCommandHandler extends BaseCreateBibliographicReference {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<JournalArticleBibliographicReference>;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource(
            this.aggregateType
        );
    }

    protected createNewInstance({
        id,
        title,
        creators,
        abstract,
        issueDate,
        publicationTitle,
        url,
        issn,
        doi,
    }: CreateJournalArticleBibliographicReference): ResultOrError<JournalArticleBibliographicReference> {
        const createDto: DTO<JournalArticleBibliographicReference> = {
            type: ResourceType.bibliographicReference,
            id,
            // a separate publication command is required
            published: false,
            data: {
                type: BibliographicReferenceType.journalArticle,
                title,
                creators,
                abstract,
                issueDate,
                publicationTitle,
                url,
                issn,
                doi,
            },
        };

        return getInstanceFactoryForResource<JournalArticleBibliographicReference>(
            ResourceType.bibliographicReference
        )(createDto);
    }

    protected buildEvent(
        command: CreateJournalArticleBibliographicReference,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new JournalArticleBibliographicReferenceCreated(command, eventId, userId);
    }
}
