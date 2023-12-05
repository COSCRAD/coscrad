import { ICommandBase, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { DigitalText } from '../../../../digital-text/entities';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../../shared/functional';
import { BookBibliographicReference } from '../../../book-bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReferenceData } from '../../../interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../../interfaces/bibliographic-reference.interface';
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
        return (instance as BookBibliographicReference).registerDigitalRepresentation(
            digitalRepresentationResourceCompositeIdentifier
        );
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: IBibliographicReference<IBibliographicReferenceData>
    ): InternalError | Valid {
        // TODO Validate references
        return Valid;
    }

    protected buildEvent(
        command: RegisterDigitalRepresentationOfBibliographicCitation,
        eventId: string,
        userId: string
    ): BaseEvent<ICommandBase> {
        return new DigitalRepresentationOfBibliographicCitationRegistered(command, eventId, userId);
    }
}
