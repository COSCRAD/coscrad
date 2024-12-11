import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICategorizableDetailQueryResult,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { CoscradConstraint } from '@coscrad/validation-constraints';
import { ThemeOptions } from '@mui/material';

export type ListenLivePageConfiguration = {
    title: string;
    logoUrl: string;
    iceCastLink: string;
    playingMessage: string;
    missionStatement: string;
    route: string;
    label: string;
};

export type SimulatedKeyboardConfig = {
    name: string;
    specialCharacterReplacements: Record<string, string>;
};

export type AlphabetConfig = {
    alphabetChartName: string;
    baseDigitalAssetUrl: string;
};

export type ThemeOverrides = Pick<ThemeOptions, 'palette'>;

export type ExternalLink = {
    title: string;
    url: string;
    description: string;
};

export type InternalLink = {
    url: string;

    iconUrl: string;

    description: string;
};

export type SocialMediaLinks = {
    facebook?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
};

export type ConfigurableContent<T extends CategorizableType = CategorizableType> = {
    // TODO sort all dummy data and this type alphabetically by field names
    indexToDetailFlows: IndexToDetailFlowDefinition<T>[];
    siteTitle: string;
    subTitle: string;
    about: string;
    shouldEnableAdminMode: boolean;
    siteDescription: string;
    siteHomeImageUrl: string;
    siteFavicon: string;
    copyrightHolder: string;
    coscradLogoUrl: string;
    organizationLogoUrl: string;
    shouldEnableWebOfKnowledgeForResources: boolean;
    siteCredits: string;
    simulatedKeyboard?: SimulatedKeyboardConfig;
    listenLive?: ListenLivePageConfiguration;
    termOfTheDayConfig?: Record<string, string>;
    notFoundMessage: string;
    loadingMessage: string;
    themeOverrides: ThemeOverrides;
    resourceIndexLabel: string;
    defaultLanguageCode: LanguageCode;
    phoneNumber: string;
    email: string;
    address: string;
    internalLinks: InternalLink[];
    externalLinks: ExternalLink[];
    socialMediaLinks: SocialMediaLinks;
    alphabetConfig?: AlphabetConfig;
};

// is this still necessary?
export const configurableContentPropertiesAndConstraints: {
    [K in keyof ConfigurableContent]: CoscradConstraint[];
} = {
    siteTitle: [CoscradConstraint.isNonEmptyString],
    subTitle: [CoscradConstraint.isNonEmptyString],
    about: [CoscradConstraint.isNonEmptyString],
    shouldEnableAdminMode: [CoscradConstraint.isBoolean],
    siteDescription: [CoscradConstraint.isNonEmptyString],
    siteHomeImageUrl: [CoscradConstraint.isURL],
    siteFavicon: [CoscradConstraint.isURL],
    copyrightHolder: [CoscradConstraint.isNonEmptyString],
    coscradLogoUrl: [CoscradConstraint.isURL],
    organizationLogoUrl: [CoscradConstraint.isURL],
    shouldEnableWebOfKnowledgeForResources: [CoscradConstraint.isBoolean],
    indexToDetailFlows: [CoscradConstraint.isRequired],
    siteCredits: [CoscradConstraint.isNonEmptyString, CoscradConstraint.isRequired],
    simulatedKeyboard: [CoscradConstraint.isObject, CoscradConstraint.isRequired],
    listenLive: [CoscradConstraint.isObject],
    termOfTheDayConfig: [CoscradConstraint.isObject],
    notFoundMessage: [CoscradConstraint.isNonEmptyString],
    loadingMessage: [CoscradConstraint.isString],
    themeOverrides: [CoscradConstraint.isObject],
    resourceIndexLabel: [CoscradConstraint.isString],
    defaultLanguageCode: [CoscradConstraint.isNonEmptyString],
    phoneNumber: [CoscradConstraint.isString],
    email: [CoscradConstraint.isString],
    address: [CoscradConstraint.isString],
    internalLinks: [],
    externalLinks: [],
    socialMediaLinks: [CoscradConstraint.isObject],
    alphabetConfig: [CoscradConstraint.isObject],
};

export type ConfigurableContentSchema = typeof configurableContentPropertiesAndConstraints;

export enum DetailViewType {
    fullView = 'full-view',
    thumbnail = 'thumbnail-view',
}

/**
 * Note that these are all required together if any one is specified. This is to
 * avoid weird situations where you provide a custom label but fall back to
 * a default plural label, for example.
 */
export type AggregateLabelOverrides = {
    label: string;
    pluralLabel: string;
    route: string;
};

export type IndexToDetailFlowDefinition<T extends CategorizableType> = {
    categorizableType: T;
    indexFilter?: (
        viewModel: ICategorizableDetailQueryResult<AggregateTypeToViewModel[T]>
    ) => boolean;
    detailViewType: DetailViewType;
    labelOverrides?: AggregateLabelOverrides; // custom override for resource label
};
