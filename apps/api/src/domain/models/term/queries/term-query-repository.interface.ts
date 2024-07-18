import {
    IDetailQueryResult,
    IMultilingualTextItem,
    ITermViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';

/**
 * TODO reconsider this. It feels awkward.
 * We should probably do away with the `IDetailQueryResult` and instead
 * absorb it into the base view model at this point, given that we are
 * denormalizing the views and we do not want to expose the tag and note joins
 * explicitly.
 */
type TermQueryModel = IDetailQueryResult<ITermViewModel>;

export const TERM_QUERY_REPOSITORY_TOKEN = 'TERM_QUERY_REPOSITORY_TOKEN';

export interface ITermQueryRepository {
    create(view: TermQueryModel): Promise<void>;

    createMany(views: TermQueryModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<TermQueryModel>>;

    fetchMany(): Promise<TermQueryModel[]>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;

    translate(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    publish(id: AggregateId): Promise<void>;

    /**
     * A better approach would be to do this atomically as part of
     * each update query. We need to find a performant and extensible way to
     * do this.
     */
    attribute(termId: AggregateId, contributorIds: AggregateId[]): Promise<void>;

    // TODO Is it the ID that we want here or the URL?
    addAudio(id: AggregateId, languageCode: LanguageCode, audioItemId: string): Promise<void>;

    count(): Promise<number>;
}
