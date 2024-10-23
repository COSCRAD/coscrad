import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../../domain/common/events/interfaces';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import getInstanceFactoryForResource from '../../../../../factories/get-instance-factory-for-resource';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../../repositories/interfaces/repository-provider.interface';
import { ResourceType } from '../../../../../types/ResourceType';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { BaseCreateBibliographicCitation } from '../../../common/commands/base-create-bibliographic-citation.command-handler';
import { BibliographicCitationType } from '../../../types/bibliographic-citation-type';
import { CourtCaseBibliographicCitation } from '../../entities/court-case-bibliographic-citation.entity';
import { CourtCaseBibliographicCitationCreated } from './court-case-bibliographic-citation-created.event';
import { CreateCourtCaseBibliographicCitation } from './create-court-case-bibliographic-citation.command';

@CommandHandler(CreateCourtCaseBibliographicCitation)
export class CreateCourtCaseBibliographicCitationCommandHandler extends BaseCreateBibliographicCitation {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<CourtCaseBibliographicCitation>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource(
            this.aggregateType
        );
    }

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        caseName,
        abstract,
        dateDecided,
        court,
        url,
        pages,
    }: CreateCourtCaseBibliographicCitation): ResultOrError<CourtCaseBibliographicCitation> {
        const createDto: DTO<CourtCaseBibliographicCitation> = {
            type: ResourceType.bibliographicCitation,
            id,
            // a separate publication command is required
            published: false,
            hasBeenDeleted: false,
            data: {
                type: BibliographicCitationType.courtCase,
                caseName,
                abstract,
                dateDecided,
                court,
                url,
                pages,
            },
        };

        return getInstanceFactoryForResource<CourtCaseBibliographicCitation>(
            ResourceType.bibliographicCitation
        )(createDto);
    }

    protected buildEvent(
        command: CreateCourtCaseBibliographicCitation,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new CourtCaseBibliographicCitationCreated(command, eventMeta);
    }
}
