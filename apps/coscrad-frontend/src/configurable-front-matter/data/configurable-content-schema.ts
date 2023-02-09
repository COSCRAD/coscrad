import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICategorizableDetailQueryResult
} from '@coscrad/api-interfaces';
import { CoscradConstraint } from '@coscrad/validation-constraints';

export type ConfigurableContent<T extends CategorizableType = CategorizableType> = {
    indexToDetailFlows: IndexToDetailFlowDefinition<T>[];
    siteTitle: string;
    subTitle: string;
    about: string;
    siteDescription: string;
    siteHomeImageUrl: string;
    copyrightHolder: string;
    organizationLogoUrl: string;
    songIdToCredits: Record<string, string>;
    videoIdToCredits: Record<string, string>;
    shouldEnableWebOfKnowledgeForResources: boolean;
    siteCredits: string;
};

export const configurableContentPropertiesAndConstraints: {
    [K in keyof ConfigurableContent]: CoscradConstraint[];
} = {
    siteTitle: [CoscradConstraint.isNonEmptyString],
    subTitle: [CoscradConstraint.isNonEmptyString],
    about: [CoscradConstraint.isNonEmptyString],
    siteDescription: [CoscradConstraint.isNonEmptyString],
    siteHomeImageUrl: [CoscradConstraint.isURL],
    copyrightHolder: [CoscradConstraint.isNonEmptyString],
    organizationLogoUrl: [CoscradConstraint.isURL],
    songIdToCredits: [CoscradConstraint.isObject],
    videoIdToCredits: [CoscradConstraint.isObject],
    shouldEnableWebOfKnowledgeForResources: [CoscradConstraint.isBoolean],
    // This is a tough one to constrain. We may need to manually specify the validation logic.
    indexToDetailFlows: [],
    siteCredits: [CoscradConstraint.isNonEmptyString]
};

export type ConfigurableContentSchema = typeof configurableContentPropertiesAndConstraints;

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
