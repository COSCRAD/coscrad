import {
    AggregateType,
    ICommandFormAndLabels,
    IIndexQueryResult,
    ITermViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CommandFSA } from '../../../app/controllers/command/command-fsa/command-fsa.entity';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { UserQueryOptions } from '../../../app/controllers/resources/term.controller';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { TermViewModel } from '../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { EventSourcedAudioItemViewModel } from '../../models/audio-visual/audio-item/queries';
import { PublishResource } from '../../models/shared/common-commands';
import { AddAudioForTerm } from '../../models/term/commands';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../models/term/queries';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';

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

    async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<ITermViewModel>> {
        const result = await this.termQueryRepository.fetchById(id, userWithGroups);

        if (isNotFound(result)) return result;

        return this.transform(result);
    }

    async fetchMany(
        userWithGroups?: CoscradUserWithGroups,
        options?: UserQueryOptions
    ): Promise<IIndexQueryResult<ITermViewModel>> {
        const { entities, page, count } = await this.termQueryRepository.fetchMany({
            ...options,
            user: userWithGroups,
        });

        return {
            // TODO ensure actions show up on entities
            entities: entities.map((e) => {
                return this.transform(e);
            }),
            // We don't use dynamic command forms for Terms any more.
            indexScopedActions: [],
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

    private transform(
        termView: TermViewModel
    ): ITermViewModel & { actions: ICommandFormAndLabels[] } {
        const { mediaItemId } = termView;

        const audioItemURL = isNullOrUndefined(mediaItemId)
            ? undefined
            : this.buildAudioUrl(mediaItemId);

        const transformed = termView as unknown as ITermViewModel & {
            actions: ICommandFormAndLabels[];
        };

        transformed.audioURL = audioItemURL;

        transformed.name = new MultilingualText(termView.name).toMultilingualTextRecord();

        // TODO Remove this. The term detail query response does not need `actions`.
        transformed.actions = [];

        return transformed;
    }

    private buildAudioUrl(mediaItemId?: AggregateId): string | undefined {
        if (isNullOrUndefined(mediaItemId)) return undefined;

        return `${this.audioUrlPrefix}/${mediaItemId}`;
    }
}
