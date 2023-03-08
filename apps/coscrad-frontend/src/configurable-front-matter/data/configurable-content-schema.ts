import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { CoscradConstraint } from '@coscrad/validation-constraints';

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

export type ConfigurableContent<
    T extends Exclude<CategorizableType, typeof CategorizableType.playlist> = Exclude<
        CategorizableType,
        typeof CategorizableType.playlist
    >
> = {
    indexToDetailFlows: IndexToDetailFlowDefinition<T>[];
    siteTitle: string;
    subTitle: string;
    about: string;
    siteDescription: string;
    siteHomeImageUrl: string;
    copyrightHolder: string;
    coscradLogoUrl: string;
    organizationLogoUrl: string;
    songIdToCredits: Record<string, string>;
    videoIdToCredits: Record<string, string>;
    shouldEnableWebOfKnowledgeForResources: boolean;
    siteCredits: string;
    simulatedKeyboard?: SimulatedKeyboardConfig;
    listenLive?: ListenLivePageConfiguration;
    termOfTheDayConfig?: Record<string, string>;
    notFoundMessage: string;
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
    coscradLogoUrl: [CoscradConstraint.isURL],
    organizationLogoUrl: [CoscradConstraint.isURL],
    songIdToCredits: [CoscradConstraint.isObject],
    videoIdToCredits: [CoscradConstraint.isObject],
    shouldEnableWebOfKnowledgeForResources: [CoscradConstraint.isBoolean],
    // This is a tough one to constrain. We may need to manually specify the validation logic.
    indexToDetailFlows: [],
    siteCredits: [CoscradConstraint.isNonEmptyString, CoscradConstraint.isRequired],
    simulatedKeyboard: [CoscradConstraint.isObject],
    listenLive: [CoscradConstraint.isObject],
    termOfTheDayConfig: [CoscradConstraint.isObject],
    notFoundMessage: [CoscradConstraint.isNonEmptyString],
};

export type ConfigurableContentSchema = typeof configurableContentPropertiesAndConstraints;

export enum DetailViewType {
    fullView = 'full-view',
    thumbnail = 'thumbnail-view',
}

export type IndexToDetailFlowDefinition<T extends CategorizableType> = {
    categorizableType: T;
    indexFilter?: (
        viewModel: ICategorizableDetailQueryResult<AggregateTypeToViewModel[T]>
    ) => boolean;
    detailViewType: DetailViewType;
    label?: string; // custom override for resource label
    route?: string; // custom route `/resources/${route}`
};
