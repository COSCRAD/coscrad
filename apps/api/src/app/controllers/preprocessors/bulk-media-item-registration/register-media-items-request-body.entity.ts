import { AudioRegistrationStrategy } from '../../../../preprocessors/audio-discovery/strategies/audio-registration-strategy.enum';

export class RegisterMediaItemsRequestBody {
    filenames: string[];

    strategy: AudioRegistrationStrategy;

    tagId: string;
}
