import { NonEmptyString } from '@coscrad/data-types';
import { IsEnum } from 'class-validator';
import { AppPlatform } from './AppPlatform';

export default class AppLink {
    @NonEmptyString()
    readonly url!: string;

    @IsEnum(AppPlatform)
    readonly platform!: AppPlatform;
}
