import { CategorizableType } from '../types/CategorizableType';

export class AggregateLabelOverrides {
    // TODO ML Text
    // TODO singularLabel, pluralLabel
    label?: string;
    pluralLabel?: string;
    route?: string;
}

export enum DetailViewType {
    fullView = 'full-view',
    thumbnail = 'thumbnail-view',
}

/**
 * Note that these overrides should be merged with the `ResourceInfo`s.
 */
export class ResourceConfig {
    categorizableType: CategorizableType;

    detailViewType: DetailViewType;

    labelOverrides: AggregateLabelOverrides;
}
