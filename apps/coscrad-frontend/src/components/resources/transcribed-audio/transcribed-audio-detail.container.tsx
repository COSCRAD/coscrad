import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const TranscribedAudioDetailContainer = (): JSX.Element =>
    AggregatePage(ResourceType.transcribedAudio);
