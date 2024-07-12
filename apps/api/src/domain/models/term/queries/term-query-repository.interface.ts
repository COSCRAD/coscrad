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

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<TermQueryModel>>;

    fetchMany(): Promise<TermQueryModel[]>;

    translate(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    addAudio(id: AggregateId, languageCode: LanguageCode, audioItemUrl: string): Promise<void>;

    count(): Promise<number>;
}
