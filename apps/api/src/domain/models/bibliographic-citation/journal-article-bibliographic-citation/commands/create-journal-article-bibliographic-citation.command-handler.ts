import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import getInstanceFactoryForResource from '../../../../factories/get-instance-factory-for-resource';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { ResourceType } from '../../../../types/ResourceType';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { BaseCreateBibliographicCitation } from '../../common/commands/base-create-bibliographic-citation.command-handler';
import { BibliographicCitationType } from '../../types/bibliogrpahic-citation-type';
import { JournalArticleBibliographicCitation } from '../entities/journal-article-bibliographic-citation.entity';
import { CreateJournalArticleBibliographicCitation } from './create-journal-article-bibliographic-citation.command';
import { JournalArticleBibliographicCitationCreated } from './journal-article-bibliographic-citation-created.event';

// TODO Remove the overlap between this and other `CREATE_BIBLIOGRAPHIC_REFERENCE` commands
@CommandHandler(CreateJournalArticleBibliographicCitation)
export class CreateJournalArticleBibliographicCitationCommandHandler extends BaseCreateBibliographicCitation {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<JournalArticleBibliographicCitation>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource(
            this.aggregateType
        );
    }

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        title,
        creators,
        abstract,
        issueDate,
        publicationTitle,
        url,
        issn,
        doi,
    }: CreateJournalArticleBibliographicCitation): ResultOrError<JournalArticleBibliographicCitation> {
        const createDto: DTO<JournalArticleBibliographicCitation> = {
            type: ResourceType.bibliographicCitation,
            id,
            // a separate publication command is required
            published: false,
            data: {
                type: BibliographicCitationType.journalArticle,
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

        return getInstanceFactoryForResource<JournalArticleBibliographicCitation>(
            ResourceType.bibliographicCitation
        )(createDto);
    }

    protected buildEvent(
        command: CreateJournalArticleBibliographicCitation,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new JournalArticleBibliographicCitationCreated(command, eventMeta);
    }
}
