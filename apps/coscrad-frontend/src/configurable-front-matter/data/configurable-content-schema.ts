import {
    AggregateTypeToViewModel,
    CategorizableType,
    CoscradDataType,
    FromCoscradDataType,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';

/**
 * We may want to refactor this to include the standard
 * `isOptional` and `isArray` options, in which case the values
 * below should be complex objects, not strings.
 */
export const configurableContentSchema = {
    siteTitle: CoscradDataType.NonEmptyString,
    subTitle: CoscradDataType.NonEmptyString,
    about: CoscradDataType.NonEmptyString,
    siteDescription: CoscradDataType.NonEmptyString,
    siteHomeImageUrl: CoscradDataType.NonEmptyString,
    copyrightHolder: CoscradDataType.NonEmptyString,
    organizationLogoUrl: CoscradDataType.NonEmptyString,
    // This is a hack. We need to represent contributors as a resource in our system and then use notes to relay this info
    // We may want to make this optional or allow an empty array
    songIdToCredits: CoscradDataType.RawData,
    videoIdToCredits: CoscradDataType.RawData,
    shouldEnableWebOfKnowledgeForResources: CoscradDataType.BOOLEAN,
} as const;

export type ConfigurableContentSchema = typeof configurableContentSchema;

export enum DetailViewType {
    fullView = 'full-view',
    thumbnail = 'thumbnail-view',
}

type IndexToDetailFlowDefinition<T extends CategorizableType> = {
    categorizableType: T;
    indexFilter?: (
        viewModel: ICategorizableDetailQueryResult<AggregateTypeToViewModel[T]>
    ) => boolean;
    detailViewType: DetailViewType;
    label?: string; // custom override for resource label
    route?: string; // custom route `/resources/${route}`
};

export type ConfigurableContent<T extends CategorizableType = CategorizableType> = {
    indexToDetailFlows: IndexToDetailFlowDefinition<T>[];
} & {
    [K in keyof typeof configurableContentSchema]: FromCoscradDataType<
        typeof configurableContentSchema[K]
    >;
};
