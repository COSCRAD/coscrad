import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import AppLink from './AppLink';

export default class AppInfo {
    @NonEmptyString()
    readonly name!: string;

    @NonEmptyString()
    readonly image!: string;

    @NonEmptyString()
    readonly meta!: string;

    @NonEmptyString()
    readonly description!: string;

    @NestedDataType(AppLink)
    readonly links!: AppLink[];
}
