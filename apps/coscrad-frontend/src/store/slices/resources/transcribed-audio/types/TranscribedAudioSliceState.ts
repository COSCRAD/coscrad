import { IIndexQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';

export type TranscribedAudioSliceState = ILoadable<IIndexQueryResult<ITranscribedAudioViewModel>>;
