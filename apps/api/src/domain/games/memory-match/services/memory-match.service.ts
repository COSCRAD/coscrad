import { IMemoryMatchCard, IMemoryMatchRound } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoscradInvalidUserInputException } from '../../../../app/controllers/response-mapping/CoscradExceptions';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../interfaces/id-manager.interface';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../types/AggregateId';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRoundCreationDto } from '../models/dtos/memory-match-round-creation.dto';
import { MemoryMatchCard } from '../models/memory-match-card.entity';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

export class MemoryMatchService {
    constructor(
        @Inject(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN)
        private readonly memoryMatchRepository: IMemoryMatchRepository,
        @Inject(ID_MANAGER_TOKEN)
        private readonly idManager: IIdManager,
        private readonly configService: ConfigService
    ) {}

    async create(
        dto: MemoryMatchRoundCreationDto
    ): Promise<AggregateId | CoscradInvalidUserInputException> {
        // TODO release the ID if not used or don't generate until you know the round is valid
        const id = await this.idManager.generate();

        const newRound = MemoryMatchRound.fromCreationDto(id, dto);

        const validationResult = newRound.validateInvariants();

        // TODO check that the media item exists for the card back image

        if (validationResult.length > 0) {
            return new CoscradInvalidUserInputException(
                new InternalError(
                    `Failed to create memory match round: ${dto.name}.`,
                    validationResult
                )
            );
        }

        await this.memoryMatchRepository.create(newRound);

        return id;
    }

    async fetchById(
        roundId: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IMemoryMatchRound>> {
        const searchResult = await this.memoryMatchRepository.fetchById(roundId);

        // handle not found or use intercepter
        if (isNotFound(searchResult)) {
            return NotFound;
        }

        // our convention is to return not published when a user does not have access to a particular resource
        const doesUserHaveAccess = searchResult.isPublished || userWithGroups?.isAdmin() || false;

        if (!doesUserHaveAccess) {
            return NotFound;
        }

        // at this point, we have a published round
        return this.buildView(searchResult);
    }

    async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<{ entities: IMemoryMatchRound[] }> {
        // TODO filter out unpublished round at the level of the database
        const searchResult = await this.memoryMatchRepository.fetchMany();

        return {
            // we use `flatMap` to achievev map + filter
            entities: searchResult.flatMap((domainModel) => {
                const doesUserHaveAccess =
                    domainModel.isPublished || userWithGroups?.isAdmin() || false;

                return doesUserHaveAccess ? [this.buildView(domainModel)] : [];
            }),
        };
    }

    // TODO should we rename `IMemoryMatchRound` to `IMemoryMatchRoundViewModel` for consistency in naming?
    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-307] Introduce a dedicated `MemoryMatchRoundViewModel` to handle this mapping layer
    private buildView(memoryMatchRound: MemoryMatchRound): IMemoryMatchRound {
        const view = cloneToPlainObject(memoryMatchRound) as unknown as IMemoryMatchRound &
            MemoryMatchRound;

        // convert media item IDs to Urls

        view.cardbackImageUrl = this.buildMediaUrl(memoryMatchRound.cardBackImageId);

        delete view.cardBackImageId;

        view.cards = view.cards.map((card: IMemoryMatchCard & MemoryMatchCard) => {
            const cardView = cloneToPlainObject(card) as IMemoryMatchCard & MemoryMatchCard;

            if (isNonEmptyString(cardView.audioId))
                cardView.audioUrl = this.buildMediaUrl(cardView.audioId);

            delete cardView.audioId;

            if (isNonEmptyString(cardView.imageId))
                cardView.imageUrl = this.buildMediaUrl(cardView.imageId);

            delete cardView.imageId;

            return cardView;
        });

        return view;
    }

    private buildMediaUrl(mediaItemId: AggregateId): string {
        return `${this.configService.get('BASE_URL')}:${this.configService.get(
            'NODE_PORT'
        )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/download/${mediaItemId}`;
    }
}
