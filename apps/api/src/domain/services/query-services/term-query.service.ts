import {
    AggregateType,
    ICommandFormAndLabels,
    ITermViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CommandFSA } from '../../../app/controllers/command/command-fsa/command-fsa.entity';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { UserQueryOptions } from '../../../app/controllers/resources/term.controller';
import { isNotFound } from '../../../lib/types/not-found';
import { TermViewModel } from '../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { EventSourcedAudioItemViewModel } from '../../models/audio-visual/audio-item/queries';
import { PublishResource } from '../../models/shared/common-commands';
import { AddAudioForTerm } from '../../models/term/commands';
import { Term } from '../../models/term/entities/term.entity';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../models/term/queries';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

interface DiscoverAudioForTermsOptions {
    shouldPublishTerms: boolean;
    languageCodeForAudio: LanguageCode;
}

interface AudioItemAndImportActions {
    audioItem: EventSourcedAudioItemViewModel;
    actions: CommandFSA[];
}

export interface AudioForTerm {
    term: TermViewModel;
    importOptions: AudioItemAndImportActions[];
}

export interface AudioDiscoveryResult {
    byTerm: AudioForTerm[];
    /**
     * This is a convenience for those using the CLI. If there are no terms with
     * multiple import options, all command FSAs across all import options will
     * be flattened into a single command stream.
     *
     * TODO Introduce an admin UX for this process instead.
     */
    bulkCommandStream?: CommandFSA[];
}

@Injectable()
export class TermQueryService {
    private readonly audioUrlPrefix: string;

    protected readonly type = ResourceType.term;

    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN)
        private readonly termQueryRepository: ITermQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService
    ) {
        // TODO we need the base URL as part of the config
        // this.audioUrlPrefix = `http://localhost:${this.configService.get(
        //     'NODE_PORT'
        // )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/download`;
        this.audioUrlPrefix = `/resources/mediaItems/download`;
    }

    // TODO add explicit return type
    async fetchById(id: AggregateId, userWithGroups?: CoscradUserWithGroups) {
        const result = await this.termQueryRepository.fetchById(id, userWithGroups);

        if (isNotFound(result)) return result;

        const { mediaItemId } = result;

        const audioItemURL = isNullOrUndefined(mediaItemId)
            ? undefined
            : this.buildAudioUrl(mediaItemId);

        const transformed = result as unknown as ITermViewModel;

        transformed.audioURL = audioItemURL;

        transformed.actions = this.fetchUserActions(userWithGroups, [result]);

        return transformed;
    }

    // TODO should we support specifications \ custom filters?
    async fetchMany(userWithGroups?: CoscradUserWithGroups, options?: UserQueryOptions) {
        const { entities, page, count } = await this.termQueryRepository.fetchMany({
            ...options,
            user: userWithGroups,
        });

        return {
            // TODO ensure actions show up on entities
            entities: entities.map((entity) => {
                Object.assign(entity, { audioURL: this.buildAudioUrl(entity.mediaItemId) });

                (entity as unknown as ITermViewModel).audioURL = this.buildAudioUrl(
                    entity.mediaItemId
                );

                (entity as unknown as ITermViewModel).actions = this.fetchUserActions(
                    userWithGroups,
                    [entity]
                );

                return entity;
            }),
            // TODO Should we register index-scoped commands in the view layer instead?
            indexScopedActions: this.fetchUserActions(userWithGroups, [Term]),
            page,
            count,
        };
    }

    async discoverAudio({
        languageCodeForAudio: languageCode,
        shouldPublishTerms,
    }: DiscoverAudioForTermsOptions): Promise<AudioDiscoveryResult> {
        const termsWithAudioCandidates = await this.termQueryRepository.discoverAudio();

        const result = termsWithAudioCandidates.map(
            ({ term, possibleAudioItems }): AudioForTerm => ({
                term,
                importOptions: possibleAudioItems.map((audioItem) => {
                    const allCommandFsas: CommandFSA[] = [];

                    const addAudioForTerm: CommandFSA<AddAudioForTerm> = {
                        type: 'ADD_AUDIO_FOR_TERM',
                        payload: {
                            aggregateCompositeIdentifier: {
                                type: AggregateType.term,
                                id: term.id,
                            },
                            audioItemId: audioItem.id,
                            languageCode,
                        },
                    };

                    allCommandFsas.push(addAudioForTerm);

                    if (shouldPublishTerms) {
                        const publishTerm: CommandFSA<PublishResource> = {
                            // TODO shouldn't we get intellisence here?
                            type: 'PUBLISH_RESOURCE',
                            payload: {
                                aggregateCompositeIdentifier: {
                                    type: AggregateType.term,
                                    id: term.id,
                                },
                            },
                        };

                        allCommandFsas.push(publishTerm);
                    }

                    return {
                        audioItem,
                        actions: allCommandFsas,
                    };
                }),
            })
        );

        // we flatten the non-ambiguous options for convenience
        const bulkCommandStream = result.flatMap(({ importOptions }) =>
            importOptions.length === 1 ? importOptions[0].actions : []
        );

        return {
            byTerm: result,
            bulkCommandStream: bulkCommandStream.length > 0 ? bulkCommandStream : null,
        };
    }

    public subscribeToWriteNotifications(): Observable<{ data: { type: string } }> {
        return this.termQueryRepository.subscribeToUpdates();
    }

    // TODO share this code with other query services
    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContexts: CommandContext[]
    ): ICommandFormAndLabels[] {
        return commandContexts.flatMap((commandContext) =>
            fetchActionsForUser(this.commandInfoService, systemUser, commandContext)
        );
    }

    private buildAudioUrl(mediaItemId?: AggregateId): string | undefined {
        if (isNullOrUndefined(mediaItemId)) return undefined;

        return `${this.audioUrlPrefix}/${mediaItemId}`;
    }
}
