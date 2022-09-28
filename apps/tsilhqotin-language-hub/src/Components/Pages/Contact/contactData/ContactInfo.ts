import { NonEmptyString } from '@coscrad/data-types';

export default class ContactInfo {
    @NonEmptyString()
    readonly name!: string;

    @NonEmptyString()
    readonly title!: string;

    @NonEmptyString()
    readonly department!: string;
}
