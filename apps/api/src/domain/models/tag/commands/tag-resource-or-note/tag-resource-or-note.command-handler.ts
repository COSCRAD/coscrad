import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../domain/common/events/interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { IEventRepository } from '../../../../../persistence/repositories/arango-command-repository-for-aggregate-root';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { CategorizableType } from '../../../../types/CategorizableType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Tag } from '../../tag.entity';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';
import { TagResourceOrNote } from './tag-resource-or-note.command';

@CommandHandler(TagResourceOrNote)
export class TagResourceOrNoteCommandHandler extends BaseUpdateCommandHandler<Tag> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,

        // TODO Make Tags fully event sourced
        @Inject(ArangoEventRepository) protected readonly eventRepository: IEventRepository,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    protected async fetchRequiredExternalState({
        taggedMemberCompositeIdentifier: { type: categorizableType, id },
    }: TagResourceOrNote): Promise<InMemorySnapshot> {
        const repository =
            categorizableType === CategorizableType.note
                ? this.repositoryProvider.getEdgeConnectionRepository()
                : this.repositoryProvider.forResource(categorizableType);

        const searchResult = await repository.fetchById(id);

        return new DeluxeInMemoryStore({
            [categorizableType]: isNotFound(searchResult) ? [] : [searchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        tag: Tag,
        { taggedMemberCompositeIdentifier }: TagResourceOrNote
    ): ResultOrError<Tag> {
        return tag.addMember(taggedMemberCompositeIdentifier);
    }

    protected validateExternalState(state: InMemorySnapshot, tag: Tag): InternalError | Valid {
        const labelCollisionErrors = tag.validateLabelAgainstExternalState(state);

        return labelCollisionErrors;
    }

    protected buildEvent(command: TagResourceOrNote, eventMeta: EventRecordMetadata): BaseEvent {
        return new ResourceOrNoteTagged(command, eventMeta);
    }
}
