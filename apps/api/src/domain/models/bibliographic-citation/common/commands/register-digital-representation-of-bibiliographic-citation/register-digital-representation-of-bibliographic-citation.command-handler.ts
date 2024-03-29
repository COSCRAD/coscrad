import { AggregateType, ICommandBase, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { isDeepStrictEqual } from 'util';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { DigitalText } from '../../../../digital-text/entities';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../../shared/functional';
import { IBibliographicCitationData } from '../../../interfaces/bibliographic-citation-data.interface';
import { IBibliographicCitation } from '../../../interfaces/bibliographic-citation.interface';
import { DigitalReprsentationAlreadyRegisteredForResourceError } from '../../errors/digital-representation-already-registered-for-resource.error';
import { FailedToRegisterDigitalRepresentationError } from '../../errors/failed-to-register-digital-representation.error';
import { DigitalRepresentationOfBibliographicCitationRegistered } from './digital-representation-of-bibliographic-citation-added.event';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-citation.command';

@CommandHandler(RegisterDigitalRepresentationOfBibliographicCitation)
export class RegisterDigitalRepresentationOfBibliographicCitationCommandHandler extends BaseUpdateCommandHandler<IBibliographicCitation> {
    protected async fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        const [allBibliographicCitations, allDigitalTexts] = await Promise.all([
            this.repositoryProvider
                .forResource<IBibliographicCitation>(ResourceType.bibliographicCitation)
                .fetchMany(),
            this.repositoryProvider.forResource<DigitalText>(ResourceType.digitalText).fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [AggregateType.bibliographicCitation]:
                allBibliographicCitations.filter(validAggregateOrThrow),
            digitalText: allDigitalTexts.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        instance: IBibliographicCitation<IBibliographicCitationData>,
        {
            digitalRepresentationResourceCompositeIdentifier,
        }: RegisterDigitalRepresentationOfBibliographicCitation
    ): ResultOrError<IBibliographicCitation<IBibliographicCitationData>> {
        // TODO Support this on all bibliographic citations
        return instance.registerDigitalRepresentation(
            digitalRepresentationResourceCompositeIdentifier
        );
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: IBibliographicCitation<IBibliographicCitationData>
    ): InternalError | Valid {
        if (!instance.digitalRepresentationResourceCompositeIdentifier) {
            throw new InternalError(
                `Failed to set digital representation for bibliographic citation`
            );
        }

        /**
         * TODO Move this logic to the domain class. At this point, it seems like
         * an abstract base class with some base implemented methods is actually
         * a good thing.
         */
        const { digitalRepresentationResourceCompositeIdentifier } = instance;

        const allBibliographicCitations = new DeluxeInMemoryStore(state).fetchAllOfType(
            AggregateType.bibliographicCitation
        );

        const collisionErrors: InternalError[] = allBibliographicCitations
            .filter(
                (otherBibliographicCitation) =>
                    otherBibliographicCitation.id !== instance.id &&
                    isDeepStrictEqual(
                        otherBibliographicCitation.digitalRepresentationResourceCompositeIdentifier,
                        digitalRepresentationResourceCompositeIdentifier
                    )
            )
            .map(
                (otherBibliographicCitation) =>
                    new DigitalReprsentationAlreadyRegisteredForResourceError(
                        digitalRepresentationResourceCompositeIdentifier,
                        otherBibliographicCitation.id
                    )
            );

        return collisionErrors.length > 0
            ? new FailedToRegisterDigitalRepresentationError(instance.id, collisionErrors)
            : Valid;
    }

    protected buildEvent(
        command: RegisterDigitalRepresentationOfBibliographicCitation,
        eventMeta: EventRecordMetadata
    ): BaseEvent<ICommandBase> {
        return new DigitalRepresentationOfBibliographicCitationRegistered(command, eventMeta);
    }
}
