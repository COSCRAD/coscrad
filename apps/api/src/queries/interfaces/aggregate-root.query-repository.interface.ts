import { Maybe } from '../../lib/types/maybe';
import { DeepPartial } from '../../types/DeepPartial';

interface HasId {
    id: string;
}

interface HasAggregateCompositeIdentifier extends HasId {
    type: string;
}

interface HasTags {
    tags: { label: string; id: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BaseAggregateRootViewModel extends HasAggregateCompositeIdentifier, HasTags {}

export interface IAggregateRootQueryRepository<T extends BaseAggregateRootViewModel> {
    // TODO Include filters \ specifications
    fetchById(id: string): Promise<Maybe<T>>;

    fetchMany(): Promise<T[]>;

    // TODO Should this be a separate interface?
    create(viewCreateDto: T): Promise<void>;

    /**
     * Our API requires an identifier on an update Dto.
     *
     * Note that we may want to have more specific interfaces for each view
     * so that our abstractions don't interfere with performance \ query
     * optimization.
     */
    update(viewUpdateDto: DeepPartial<T> & HasId): Promise<void>;

    /**
     * TODO This offers an escape hatch in case our abstractions are getting
     * in the way of query tuning.
     */
    executeRawQuery(queryString: string, bindParams: Record<string, unknown>): Promise<void>;
}
