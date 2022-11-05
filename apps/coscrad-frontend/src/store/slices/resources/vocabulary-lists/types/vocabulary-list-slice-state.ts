import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';

export type VocabularyListSliceState = ILoadable<IIndexQueryResult<IVocabularyListViewModel>>;
