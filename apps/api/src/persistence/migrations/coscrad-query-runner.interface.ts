import { HasId } from '@coscrad/api-interfaces';
import { ArangoDatabaseDocument } from '../database/utilities/mapEntityDTOToDatabaseDocument';

export interface UpdateQueryOptions<TOldDocument> {
    propertiesToRemove?: (keyof TOldDocument)[];
}

/**
 * Note that this really isn't doing a lot right now. That's because the
 * it depends on the `ArangoDatabaseDocument` specific type. To move to
 * another db, we would need to abstract over this by forcing the caller
 * to inject the `thin mapping layer` to convert a domain DTO to a database document.
 * When doing this for arango, we convert `id` to `_key`, for example.
 */
export interface ICoscradQueryRunner {
    fetchMany<TDocument>(collectionName: string): Promise<TDocument[]>;

    update<
        TOldDocument extends ArangoDatabaseDocument<HasId>,
        UNewDocument extends ArangoDatabaseDocument<HasId>
    >(
        collectionName: string,
        calculateUpdate: (oldDoc: TOldDocument) => Partial<UNewDocument>
    ): Promise<void>;

    create<T>(collectionName: string, document: T): Promise<void>;

    delete(collectionName: string, documentId: string): Promise<void>;
}
