import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Controller, Get, Param, UseFilters, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AggregateId } from '../../../domain/types/AggregateId';
import { isNullOrUndefined } from '../../../domain/utilities/validation/is-null-or-undefined';
import { NotFound } from '../../../lib/types/not-found';
import { ArangoDatabaseForCollection } from '../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { QueryResponseTransformInterceptor } from '../response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../response-mapping/CoscradExceptions/exception-filters';

type GameDto = {
    id: AggregateId;
    name: string;
};

interface Sequential {
    sequence_number: string;
}

interface Alphabet extends GameDto {
    data: {
        alphabet_cards: Sequential[];
    };
}

const isAlphabet = (input: unknown): input is Alphabet => {
    if (isNullOrUndefined(input)) return false;

    const { data } = input as Alphabet;

    if (isNullOrUndefined(data)) return false;

    const { alphabet_cards: alphabetCards } = data;

    if (!Array.isArray(alphabetCards)) return false;

    return alphabetCards.length > 0 && isNonEmptyString(alphabetCards[0].sequence_number);
};

/**
 * Note that this is a temporary work-around for serving up legacy data.
 * In the future we would have dedicated domain and view models or possibly
 * a separate back-end for game data.
 */
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
@Controller('games')
export class GameController {
    private readonly gamesDatabase: ArangoDatabaseForCollection<GameDto>;

    constructor(
        private readonly configService: ConfigService,
        databaseProvider: ArangoDatabaseProvider
    ) {
        this.gamesDatabase = databaseProvider.getDatabaseForCollection(
            'games' as ArangoCollectionId
        );
    }

    @Get(':name')
    async fetchGame(@Param('name') nameToFind: string) {
        // Note that the config is technically a string 'false', we should deal with this later
        if (this.configService.get<string>('SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT') === 'false')
            // TODO Send correct error code do this now
            return NotFound;

        // we should search in the database
        // why not have a `fetchByName` or `fetchId` or `fetchOne`
        // Note that we bypass any kind of repository \ validation layers for this quick-and-dirty support for legacy data
        const allGames = await this.gamesDatabase.fetchMany();

        /**
         * Note that this is not efficient, but we should never have more than a few
         * documents or else it's time to have a proper backend for this data.
         */
        const searchResult = allGames.find(({ name }) => nameToFind === name);

        if (isNullOrUndefined(searchResult)) return NotFound;

        if (isAlphabet(searchResult)) {
            const sortedCards = searchResult.data.alphabet_cards.sort(
                (a, b) => Number.parseInt(a.sequence_number) - Number.parseInt(b.sequence_number)
            );

            delete searchResult.data.alphabet_cards;

            searchResult.data.alphabet_cards = sortedCards;

            return searchResult;
        }

        /**
         * We are skipping any  kind of view layer here. We can add a data model
         * and view layer when we are ready to create \ update game data via
         * an admin panel. For now, we just need a way to serve up legacy JSON
         * data quickly so we can phase out old systems.
         */
        return searchResult;
    }
}
