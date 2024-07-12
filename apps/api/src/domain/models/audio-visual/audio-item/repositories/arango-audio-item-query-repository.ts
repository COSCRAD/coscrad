import {
    IAudioItemViewModel,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
} from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { IAudioItemQueryRepository } from '../queries/audio-item-query-repository.interface';

export class ArangoAudioItemQueryRepository implements IAudioItemQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<IAudioItemViewModel & { actions: ICommandFormAndLabels[] }>
    >;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'audioItem__VIEWS'
        );
    }

    async create(
        view: IDetailQueryResult<IAudioItemViewModel> & { _actions: ICommandFormAndLabels[] }
    ): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    delete(_id: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async fetchById(
        id: AggregateId
    ): Promise<Maybe<IAudioItemViewModel & { actions: ICommandFormAndLabels[] }>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        // should we rename this helper method?
        return mapDatabaseDocumentToAggregateDTO(result);
    }

    fetchMany(): Promise<(IAudioItemViewModel & { actions: ICommandFormAndLabels[] })[]> {
        throw new Error('Method not implemented.');
    }

    translateName(_id: AggregateId, _translationItem: IMultilingualTextItem): Promise<void> {
        throw new Error('Method not implemented.');
    }

    count(): Promise<number> {
        throw new Error('Method not implemented.');
    }
}
