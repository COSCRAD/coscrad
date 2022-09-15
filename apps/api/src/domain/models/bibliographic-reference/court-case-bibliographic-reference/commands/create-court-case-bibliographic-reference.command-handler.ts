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
import { CourtCaseBibliographicReference } from '../entities/court-case-bibliographic-reference.entity';
import { CourtCaseBibliographicReferenceCreated } from './court-case-bibliographic-reference-created.event';
import { CreateCourtCaseBibliographicReference } from './create-court-case-bibliographic-reference.command';

@CommandHandler(CreateCourtCaseBibliographicReference)
export class CreateCourtCaseBibliographicReferenceCommandHandler extends BaseCreateBibliographicReference {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<CourtCaseBibliographicReference>;

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
        caseName,
        abstract,
        dateDecided,
        court,
        url,
        pages,
    }: CreateCourtCaseBibliographicReference): ResultOrError<CourtCaseBibliographicReference> {
        const createDto: DTO<CourtCaseBibliographicReference> = {
            type: ResourceType.bibliographicReference,
            id,
            // a separate publication command is required
            published: false,
            data: {
                type: BibliographicReferenceType.courtCase,
                caseName,
                abstract,
                dateDecided,
                court,
                url,
                pages,
            },
        };

        return getInstanceFactoryForResource<CourtCaseBibliographicReference>(
            ResourceType.bibliographicReference
        )(createDto);
    }

    protected buildEvent(
        command: CreateCourtCaseBibliographicReference,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new CourtCaseBibliographicReferenceCreated(command, eventId, userId);
    }
}
