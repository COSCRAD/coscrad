import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import AppLink from './AppLink';

export default class AppInfo {
    @NonEmptyString({
        label: 'name',
        description: 'name of app'
    })
    readonly name!: string;

    
    @NonEmptyString({
        label: 'TODO add me',
        description: 'TODO add me'
    })
    readonly image!: string;

    @NonEmptyString({
        label: 'TODO add me',
        description: 'TODO add me'
    })
    readonly meta!: string;

    @NonEmptyString({
        label: 'TODO add me',
        description: 'TODO add me'
    })
    readonly description!: string;

    @NestedDataType(AppLink,{
        label: 'TODO add me',
        description: 'TODO add me'
    })
    readonly links!: AppLink[];
}
