import {
    IAudioItemViewModel,
    IDetailQueryResult,
    IIndexQueryResult,
    IMediaAnnotation,
} from '@coscrad/api-interfaces';
import { Inject, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { StateBasedAudioItemViewModel } from '../../../queries/buildViewModelForResource/viewModels/audio-visual/audio-item.view-model.state-based';
import { AudioItem } from '../../models/audio-visual/audio-item/entities/audio-item.entity';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../models/audio-visual/audio-item/queries/audio-item-query-repository.interface';
import BaseDomainModel from '../../models/base-domain-model.entity';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

export type AudioLineageRecord = {
    filename: string;
    audioItemId: AggregateId;
};

export class AudioItemQueryService {
    protected readonly type = ResourceType.audioItem;

    constructor(
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

        if (isNotFound(result)) return result;

        const audioItem = result.forUser(userWithGroups);

        if (isNotFound(audioItem)) {
            return audioItem;
        }

        return {
            ...result,
            actions: fetchActionsForUser(this.commandInfoService, userWithGroups, result),
        };
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
            entities: result.flatMap((audioItem) => {
                const result = audioItem.forUser(userWithGroups);

                if (isNotFound(result)) {
                    return [];
                }

                result.actions = fetchActionsForUser(
                    this.commandInfoService,
                    userWithGroups,
                    result
                );

                return result;
            }),
        };
    }

    buildViewModel(
        transcribedAudioInstance: AudioItem,
        { resources: { mediaItem: mediaItems }, contributor: allContributors }: InMemorySnapshot
    ): // note that actions (available commands) are added at a higher level
    Omit<IAudioItemViewModel, 'actions'> {
        return new StateBasedAudioItemViewModel(
            transcribedAudioInstance,
            mediaItems,
            allContributors,
            `${this.configService.get('BASE_URL')}/${this.configService.get('GLOBAL_PREFIX')}`
        );
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [AudioItem as unknown as DomainModelCtor<AudioItem>];
    }

    async getAnnotations(): Promise<IMediaAnnotation[]> {
        throw new NotImplementedException('get annotations must be refactored');

        // const flastSnapshot = await this.fetchRequiredExternalState();

        // const inMemoryStore = new DeluxeInMemoryStore(flastSnapshot);

        // return buildAnnotationsFromSnapshot(inMemoryStore);
    }

    async getMediaLineage(): Promise<AudioLineageRecord[]> {
        throw new NotImplementedException('get media lineage must be refactored');
    }
}
