import { NonEmptyString } from '@coscrad/data-types';

export default class ContactInfo {
    @NonEmptyString({
        label: 'name',
        description: 'name of contributor',
    })
    readonly name!: string;

    @NonEmptyString({
        label: 'title',
        description: 'job title for contributor',
    })
    readonly title!: string;

    @NonEmptyString({
        label: 'department',
        description: 'job department for contributor',
    })
    readonly department!: string;
}
