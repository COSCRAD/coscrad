import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Tag } from '../../tag.entity';
import { RelabelTag } from './relabel-tag.command';
import { TagRelabelled } from './tag-relabelled.event';

@CommandHandler(RelabelTag)
export class RelabelTagCommandHandler extends BaseUpdateCommandHandler<Tag> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Tag>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = repositoryProvider.getTagRepository();
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const tagFetchResult = await this.repositoryForCommandsTargetAggregate.fetchMany();

        const allTags = tagFetchResult.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            tag: allTags,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(instance: Tag, { newLabel }: RelabelTag): ResultOrError<Tag> {
        return instance.relabel(newLabel);
    }

    protected validateExternalState(state: InMemorySnapshot, tag: Tag): InternalError | Valid {
        return tag.validateLabelAgainstExternalState(state);
    }

    protected buildEvent(command: RelabelTag, eventMeta: EventRecordMetadata): BaseEvent {
        return new TagRelabelled(command, eventMeta);
    }
}
