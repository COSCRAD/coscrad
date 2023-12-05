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
import { validAggregateOrThrow } from '../../../../shared/functional';
import { IBibliographicReferenceData } from '../../../interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../../interfaces/bibliographic-reference.interface';
import { DigitalReprsentationAlreadyRegisteredForResourceError } from '../../errors/digital-representation-already-registered-for-resource.error';
import { FailedToRegisterDigitalRepresentationError } from '../../errors/failed-to-register-digital-representation.error';
import { DigitalRepresentationOfBibliographicCitationRegistered } from './digital-representation-of-bibliographic-citation-added.event';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-citation.command';

@CommandHandler(RegisterDigitalRepresentationOfBibliographicCitation)
export class RegisterDigitalRepresentationOfBibliographicCitationCommandHandler extends BaseUpdateCommandHandler<IBibliographicReference> {
    protected async fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        const [allBibliographicReferences, allDigitalTexts] = await Promise.all([
            this.repositoryProvider
                .forResource<IBibliographicReference>(ResourceType.bibliographicReference)
                .fetchMany(),
            this.repositoryProvider.forResource<DigitalText>(ResourceType.digitalText).fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            bibliographicReference: allBibliographicReferences.filter(validAggregateOrThrow),
            digitalText: allDigitalTexts.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        instance: IBibliographicReference<IBibliographicReferenceData>,
        {
            digitalRepresentationResourceCompositeIdentifier,
        }: RegisterDigitalRepresentationOfBibliographicCitation
    ): ResultOrError<IBibliographicReference<IBibliographicReferenceData>> {
        // TODO Support this on all bibliographic references
        return instance.registerDigitalRepresentation(
            digitalRepresentationResourceCompositeIdentifier
        );
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: IBibliographicReference<IBibliographicReferenceData>
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

        const allBibliographicReferences = new DeluxeInMemoryStore(state).fetchAllOfType(
            AggregateType.bibliographicReference
        );

        const collisionErrors: InternalError[] = allBibliographicReferences
            .filter(
                (otherBibliographicReference) =>
                    otherBibliographicReference.id !== instance.id &&
                    isDeepStrictEqual(
                        otherBibliographicReference.digitalRepresentationResourceCompositeIdentifier,
                        digitalRepresentationResourceCompositeIdentifier
                    )
            )
            .map(
                (otherBibliographicReference) =>
                    new DigitalReprsentationAlreadyRegisteredForResourceError(
                        digitalRepresentationResourceCompositeIdentifier,
                        otherBibliographicReference.id
                    )
            );

        return collisionErrors.length > 0
            ? new FailedToRegisterDigitalRepresentationError(instance.id, collisionErrors)
            : Valid;
    }

    protected buildEvent(
        command: RegisterDigitalRepresentationOfBibliographicCitation,
        eventId: string,
        userId: string
    ): BaseEvent<ICommandBase> {
        return new DigitalRepresentationOfBibliographicCitationRegistered(command, eventId, userId);
    }
}
