import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Term } from '../../entities/term.entity';
import { AddVideoForTerm } from './add-video-for-term.command';
import { VideoAddedForTerm } from './video-added-for-term.event';

@CommandHandler(AddVideoForTerm)
export class AddVideoForTermCommandHandler extends BaseUpdateCommandHandler<Term> {
    protected actOnInstance(
        term: Term,
        { videoId: videoId }: AddVideoForTerm
    ): ResultOrError<Term> {
        return term.addVideo(videoId);
    }

    protected async fetchRequiredExternalState({
        videoId,
    }: AddVideoForTerm): Promise<InMemorySnapshot> {
        const videoSearchResult = await this.repositoryProvider
            .forResource(ResourceType.video)
            .fetchById(videoId);

        if (isInternalError(videoSearchResult)) {
            throw videoSearchResult;
        }

        const allVideos = isNotFound(videoSearchResult) ? [] : [videoSearchResult];

        return Promise.resolve(
            new DeluxeInMemoryStore({ video: allVideos }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Term
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(payload: AddVideoForTerm, eventMeta: EventRecordMetadata): BaseEvent {
        return new VideoAddedForTerm(payload, eventMeta);
    }
}
