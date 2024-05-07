import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import buildInstanceFactory from '../../../../../../domain/factories/utilities/buildInstanceFactory';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent, IEventPayload } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { CoscradDate } from '../../../utilities';
import { CoscradContributor } from '../../entities/coscrad-contributor.entity';
import { ContributorCreated } from './contributor-created.event';
import { CreateContributor } from './create-contributor.command';

@CommandHandler(CreateContributor)
export class CreateContributorCommandHandler extends BaseCreateCommandHandler<CoscradContributor> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        firstName,
        lastName,
        dateOfBirth,
        shortBio,
    }: CreateContributor): ResultOrError<CoscradContributor> {
        const dateBuildResult = isNonEmptyString(dateOfBirth)
            ? CoscradDate.parseString(dateOfBirth)
            : undefined;

        if (isInternalError(dateBuildResult)) {
            return dateBuildResult;
        }

        const createDto: DTO<CoscradContributor> = {
            type: AggregateType.contributor,
            id,
            fullName: { firstName, lastName },
            dateOfBirth: dateBuildResult,
            shortBio,
        };

        return buildInstanceFactory(CoscradContributor)(createDto);
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: CoscradContributor
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        commandPayload: CreateContributor,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        const eventPayload = cloneToPlainObject(commandPayload);

        if (isNonEmptyString(eventPayload.dateOfBirth)) {
            // Here we convert the string that came from user input to our internal data format
            eventPayload.dateOfBirth = CoscradDate.parseString(commandPayload.dateOfBirth);
        }

        return new ContributorCreated(eventPayload, eventMeta);
    }
}
