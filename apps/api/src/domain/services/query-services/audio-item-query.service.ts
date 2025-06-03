import {
    IAudioItemViewModel,
    IDetailQueryResult,
    IIndexQueryResult,
    IMediaAnnotation,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { AudioItem } from '../../models/audio-visual/audio-item/entities/audio-item.entity';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../models/audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../types/ResourceType';
import { buildAnnotationsFromSnapshot } from './build-annotations-from-snapshot';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

export type AudioLineageRecord = {
    filename: string;
    audioItemId: AggregateId;
};

export class AudioItemQueryService {
    protected readonly type = ResourceType.audioItem;

    constructor(
        /**
         * TODO remove this dependency. We only use it for media item joins. A
         * good step would be to inject a `MediaManagementService` here instead.
         */
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        private readonly domainRepositoryProvider: IRepositoryProvider,
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN)
        private readonly audioItemQueryRepository: IAudioItemQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {}

    async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IDetailQueryResult<IAudioItemViewModel>>> {
        const result = await this.audioItemQueryRepository.fetchById(id);

        if (!isNotFound(result))
            result.actions = fetchActionsForUser(this.commandInfoService, userWithGroups, result);

        return result;
    }

    async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IAudioItemViewModel>> {
        const result = await this.audioItemQueryRepository.fetchMany();

        return {
            // TODO Use `AudioItemViewModel` here
            indexScopedActions: fetchActionsForUser(
                this.commandInfoService,
                userWithGroups,
                AudioItem
            ),
            entities: result,
        };
    }

    async getAnnotations(): Promise<IMediaAnnotation[]> {
        /**
         * TODO These joins are neither efficient nor atomic. Once we have finished
         * denormalizing notes and tags onto the resource documents in the query
         * database, we should leverage the query database for this query.
         */
        const audioItems = (
            await this.domainRepositoryProvider.forResource(ResourceType.audioItem).fetchMany()
        ).filter(validAggregateOrThrow);

        const mediaItems = (
            await this.domainRepositoryProvider
                .forResource<MediaItem>(ResourceType.mediaItem)
                .fetchMany()
        ).filter(validAggregateOrThrow);

        const tags = (await this.domainRepositoryProvider.getTagRepository().fetchMany()).filter(
            validAggregateOrThrow
        );

        const notes = (
            await this.domainRepositoryProvider.getEdgeConnectionRepository().fetchMany()
        ).filter(validAggregateOrThrow);

        const inMemoryStore = new DeluxeInMemoryStore({
            audioItem: audioItems,
            mediaItem: mediaItems,
            tag: tags,
            note: notes,
        });

        return buildAnnotationsFromSnapshot(inMemoryStore);
    }

    async getMediaLineage(): Promise<AudioLineageRecord[]> {
        /**
         * TODO Use denormalized query database to perform this query.
         */
        const audioItems = (
            await this.domainRepositoryProvider
                .forResource<AudioItem>(ResourceType.audioItem)
                .fetchMany()
        ).filter(validAggregateOrThrow);

        const mediaItems = await this.domainRepositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany();

        const mediaFilenameById = mediaItems
            .filter(validAggregateOrThrow)
            .reduce(
                (table, mediaItem) =>
                    table.set(mediaItem.id, mediaItem.getName().getOriginalTextItem().text),
                new Map()
            );

        const mediaFilenameByAudioItemId = audioItems.reduce((table, audioItem) => {
            const { id, mediaItemId } = audioItem;

            const filename = mediaFilenameById.get(mediaItemId);

            return table.set(id, filename);
        }, new Map());

        return Array.from(mediaFilenameByAudioItemId.entries()).map(([audioItemId, filename]) => ({
            audioItemId,
            filename,
        }));
    }
}
