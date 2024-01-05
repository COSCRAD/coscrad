import { IDigitalTextViewModel } from '@coscrad/api-interfaces';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound } from '../../lib/types/not-found';
import { ArangoDatabaseForCollection } from '../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDTO from '../../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import { DeepPartial } from '../../types/DeepPartial';
import { IAggregateRootQueryRepository } from '../interfaces';
import { DigitalTextViewModel } from './digital-text.view-model';

/**
 * TODO Generalize this for any aggregate root.
 *
 * TODO Shouldn't this be moved to the persistence module?
 */
export class ArangoDigitalTextQueryRepository
    implements IAggregateRootQueryRepository<IDigitalTextViewModel>
{
    constructor(
        private readonly arangoDatabaseForViewCollection: ArangoDatabaseForCollection<DigitalTextViewModel>
    ) {}

    public async fetchById(id: string): Promise<Maybe<IDigitalTextViewModel>> {
        const documentSearchResult = await this.arangoDatabaseForViewCollection.fetchById(id);

        if (isNotFound(documentSearchResult)) return documentSearchResult;

        return DigitalTextViewModel.fromSnapshot(
            mapDatabaseDocumentToAggregateDTO(documentSearchResult)
        );
    }

    public async fetchMany(): Promise<IDigitalTextViewModel[]> {
        const searchResult = await this.arangoDatabaseForViewCollection.fetchMany();

        return searchResult
            .map(mapDatabaseDocumentToAggregateDTO)
            .map((snapshot) => DigitalTextViewModel.fromSnapshot(snapshot));
    }

    public create(view: DigitalTextViewModel): Promise<void> {
        const document = mapEntityDTOToDatabaseDTO(view);

        return this.arangoDatabaseForViewCollection.create(document);
    }

    public update(
        updateDto: Pick<DigitalTextViewModel, 'id'> & DeepPartial<DigitalTextViewModel>
    ): Promise<void> {
        return this.arangoDatabaseForViewCollection
            .update(updateDto.id, updateDto)
            .catch((_error) => {
                throw new InternalError(`Failed to update view with update: ${updateDto}`);
            });
    }

    public executeRawQuery(
        _queryString: string,
        _bindParams: Record<string, unknown>
    ): Promise<void> {
        throw new InternalError(`**Not Implemented** DigitalTextQueryRepository.executeRawQuery`);
    }
}
