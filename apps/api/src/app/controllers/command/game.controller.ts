import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AggregateId } from '../../../domain/types/AggregateId';
import { isNullOrUndefined } from '../../../domain/utilities/validation/is-null-or-undefined';
import { NotFound } from '../../../lib/types/not-found';
import { ArangoDatabaseForCollection } from '../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';

type GameDto = {
    id: AggregateId;
    name: string;
};

/**
 * Note that this is a temporary work-around for serving up legacy data.
 * In the future we would have dedicated domain and view models or possibly
 * a separate back-end for game data.
 */
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
            // TODO Send correct error code
            return 'Not Available';

        const allGames = await this.gamesDatabase.fetchMany();

        const searchResult = allGames.find(({ name }) => nameToFind === name);

        if (isNullOrUndefined(searchResult)) return NotFound;

        // We are skipping any  kind of view layer here
        return searchResult;
    }
}
