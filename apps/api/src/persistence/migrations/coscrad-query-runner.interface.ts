import { HasId } from '@coscrad/api-interfaces';
import { DatabaseDTO } from '../database/utilities/mapEntityDTOToDatabaseDTO';

export interface UpdateQueryOptions<TOldDocument> {
    propertiesToRemove?: (keyof TOldDocument)[];
}

/**
 * There's not much reason for this interface if we are going to use `DatabaseDTO`,
 * which is Arango specific, here. We might want to do away with this.
 */
export interface ICoscradQueryRunner {
    update<TOldDocument extends DatabaseDTO<HasId>, UNewDocument>(
        collectionName: string,
        calculateUpdate: (oldDoc: TOldDocument) => Partial<UNewDocument>
    ): Promise<void>;
}
