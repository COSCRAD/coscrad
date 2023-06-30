import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import AppLink from './AppLink';

export default class AppInfo {
    @NonEmptyString({
        label: 'name',
        description: 'name of app',
    })
    readonly name!: string;

    @NonEmptyString({
        label: 'image',
        description: 'app icon url',
    })
    readonly image!: string;

    @NonEmptyString({
        label: 'metadata',
        description: 'information about the app',
    })
    readonly meta!: string;

    @NonEmptyString({
        label: 'description',
        description: 'description about the app',
    })
    readonly description!: string;

    @NestedDataType(AppLink, {
        label: 'app link',
        description: 'a link to the web or mobile app',
    })
    readonly links!: AppLink[];
}
