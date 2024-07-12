import {
    IAudioItemViewModel,
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
} from '@coscrad/api-interfaces';
import { Maybe } from '../../../../../lib/types/maybe';
import { AggregateId } from '../../../../types/AggregateId';

/**
 * TODO reconsider this. It feels awkward.
 * We should probably do away with the `IDetailQueryResult` and instead
 * absorb it into the base view model at this point, given that we are
 * denormalizing the views and we do not want to expose the tag and note joins
 * explicitly.
 */
type IAudioItemQueryModel = IDetailQueryResult<IAudioItemViewModel> & {
    actions: ICommandFormAndLabels[];
};

export const AUDIO_QUERY_REPOSITORY_TOKEN = 'AUDIO_QUERY_REPOSITORY_TOKEN';

export interface IAudioItemQueryRepository {
    create(view: IAudioItemQueryModel): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<IAudioItemQueryModel>>;

    fetchMany(): Promise<IAudioItemQueryModel[]>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    count(): Promise<number>;
}
