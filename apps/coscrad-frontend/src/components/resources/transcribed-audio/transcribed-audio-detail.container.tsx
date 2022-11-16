import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const TranscribedAudioDetailContainer = (): JSX.Element =>
    ResourcePage(ResourceType.transcribedAudio);
