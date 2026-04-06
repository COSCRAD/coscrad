import { IToken, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';

export class MultilingualAudioTextItemRecord {
    audioUrl?: string;
    text: string;
    tokens: IToken;
}

export class MultilingualAudioTextRecord {
    original: MultilingualAudioTextItemRecord;

    originalLanguageCode: LanguageCode;

    translations: Record<
        LanguageCode,
        Record<MultilingualTextItemRole, MultilingualAudioTextItemRecord>
    >;
}
