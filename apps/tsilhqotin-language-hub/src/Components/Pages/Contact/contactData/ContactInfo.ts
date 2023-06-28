import { NonEmptyString } from '@coscrad/data-types';

export default class ContactInfo {
    @NonEmptyString({
        label: 'TODO add me',
        description: 'TODO add me',
    })
    readonly name!: string;

    @NonEmptyString({
        label: 'TODO add me',
        description: 'TODO add me',
    })
    readonly title!: string;

    @NonEmptyString({
        label: 'TODO add me',
        description: 'TODO add me',
    })
    readonly department!: string;
}
