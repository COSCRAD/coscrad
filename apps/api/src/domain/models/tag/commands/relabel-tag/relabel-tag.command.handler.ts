import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../../types/ResultOrError';
import TagLabelAlreadyInUseError from '../../../../domainModelValidators/errors/tag/TagLabelAlreadyInUseError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Tag } from '../../tag.entity';
import { RelabelTag } from './relabel-tag.command';
import { TagRelabelled } from './tag-relabelled.event';

@CommandHandler(RelabelTag)
export class RelabelTagCommandHandler extends BaseUpdateCommandHandler<Tag> {
    protected aggregateType: AggregateType = AggregateType.tag;

    /**
     * TODO Remove this- it's no longer needed since we consistently use
     * `aggregateCompositeIdentifier` for this prop on all command payloads.
     */
    protected getAggregateIdFromCommand({
        aggregateCompositeIdentifier: { id },
    }: RelabelTag): AggregateId {
        return id;
    }

    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Tag>;

    constructor(
        @Inject(RepositoryProvider) protected readonly repositoryProvider: IRepositoryProvider,
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
        const { tag: allTags } = state;

        const otherTags = allTags.filter(
            (otherTag) => otherTag.getCompositeIdentifier() !== tag.getCompositeIdentifier()
        );

        const duplicateLabelErrors = otherTags
            .filter(({ label }) => label === tag.label)
            .map(
                (otherTag) =>
                    new TagLabelAlreadyInUseError(tag.label, otherTag.getCompositeIdentifier().id)
            );

        return duplicateLabelErrors.length > 0
            ? new InvalidExternalStateError(duplicateLabelErrors)
            : Valid;
    }

    protected buildEvent(command: RelabelTag, eventId: string, userId: string): BaseEvent {
        return new TagRelabelled(command, eventId, userId);
    }
}
