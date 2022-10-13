import { NonEmptyString } from '@coscrad/data-types';

export default class FrontMatter {
    @NonEmptyString()
    readonly siteTitle!: string;

    @NonEmptyString()
    readonly subTitle!: string;

    @NonEmptyString()
    readonly about!: string;

    @NonEmptyString()
    readonly siteDescription!: string;

    @NonEmptyString()
    readonly copyrightHolder!: string;
}
