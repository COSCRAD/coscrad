import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../factories/utilities/buildInstanceFactory';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Tag } from '../../tag.entity';
import { CreateTag } from './create-tag.command';
import { TagCreated } from './tag-created.event';

@CommandHandler(CreateTag)
export class CreateTagCommandHandler extends BaseCreateCommandHandler<Tag> {
    createNewInstance({ aggregateCompositeIdentifier, label }: CreateTag): ResultOrError<Tag> {
        const { id } = aggregateCompositeIdentifier;

        const createDto: DTO<Tag> = {
            type: AggregateType.tag,
            id,
            label,
            members: [],
        };

        return buildInstanceFactory(Tag)(createDto);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const preExistingTags = await this.repositoryProvider.getTagRepository().fetchMany();

        const validPreExistingTags = preExistingTags.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            [AggregateType.tag]: validPreExistingTags,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(state: InMemorySnapshot, instance: Tag): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(command: CreateTag, eventId: string, userId: string): BaseEvent {
        return new TagCreated(command, eventId, userId);
    }
}
