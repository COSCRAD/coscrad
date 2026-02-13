import { LanguageCode } from '@coscrad/api-interfaces';
import { ITokenizer } from './tokenizer.interface';

export const TOKENIZER_PROVIDER_INJECTION_TOKEN = 'TOKENIZER_PROVIDER_INJECTION_TOKEN';

export interface ITokenizerProvider {
    has(langaugeCode: string): boolean;

    forLanguage(string: LanguageCode): ITokenizer;
}
