import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import { ResultOrError } from '../../../../../types/ResultOrError';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Playlist } from '../../entities';
import { PlaylistItem } from '../../entities/playlist-item.entity';
import { AudioItemsImportedToPlaylist } from './audio-items-imported-to-playlist.event';
import { ImportAudioItemsToPlaylist } from './import-audio-items-to-playlist.command';

@CommandHandler(ImportAudioItemsToPlaylist)
export class ImportAudioItemsToPlaylistCommandHandler extends BaseUpdateCommandHandler<Playlist> {
    protected async fetchRequiredExternalState(
        _: ImportAudioItemsToPlaylist
    ): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({
            /**
             * We use `validateAdditionalConstraints` below in order to optimize
             * the query.
             */
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Playlist
    ): InternalError | Valid {
        // References to audio items are validated in `validateAdditionalConstraints` for performance
        return Valid;
    }

    protected actOnInstance(
        playlist: Playlist,
        { audioItemIds }: ImportAudioItemsToPlaylist
    ): ResultOrError<Playlist> {
        return playlist.addItems(
            audioItemIds.map(
                (id) =>
                    new PlaylistItem({
                        resourceCompositeIdentifier: { type: ResourceType.audioItem, id },
                    })
            )
        );
    }

    protected buildEvent(
        command: ImportAudioItemsToPlaylist,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new AudioItemsImportedToPlaylist(command, eventMeta);
    }

    protected override validateReferences(
        _command: ICommandBase,
        _snapshot: InMemorySnapshot
    ): ValidationResult {
        /**
         * We opt out of this for performance reasons. References are validated
         * in `validateAdditionalConstraints` instead.
         */
        return Valid;
    }

    protected async validateAdditionalConstraints(
        { aggregateCompositeIdentifier, audioItemIds }: ImportAudioItemsToPlaylist,
        __?: InMemorySnapshot
    ): Promise<Valid | InternalError> {
        const missingTerms = await this.repositoryProvider
            .forResource(ResourceType.audioItem)
            .exist(audioItemIds);

        if (missingTerms.length == 0) {
            return Valid;
        }

        return new InvalidExternalReferenceByAggregateError(
            aggregateCompositeIdentifier,
            missingTerms.map((id) => ({
                type: AggregateType.audioItem,
                id,
            }))
        );
    }
}
