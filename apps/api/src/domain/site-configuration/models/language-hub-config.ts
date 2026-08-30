import { LanguageCode } from '@coscrad/api-interfaces';
import { ExternalEnum, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { InternalError } from '../../../lib/errors/InternalError';
import { SimulatedKeyboard } from '../../../lib/nlp/types/simulated-keyboard';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import validateSimpleInvariants from '../../domainModelValidators/utilities/validateSimpleInvariants';
import { AggregateId } from '../../types/AggregateId';
import { SocialMediaLinkDirectory } from '../social-media-link-directory';
import { ThemeOverrides } from '../theme-overrides';
import { AdditionalMaterial } from './additional-material';
import { AlphabetConfig } from './alphabet-config';
import { SiteConfigCreationDto } from './dtos/site-config-creation-dto';
import { ExternalLink } from './external-link';
import { InternalLink } from './internal-link';
import { MemoryMatchConfig } from './memory-match-config';
import { RadioStreamConfig } from './radio-stream-config';
import { ResourceConfig } from './resource-config';

export class LanguageHubConfig {
    @UUID({
        label: 'site config ID',
        description: 'A unique system identifier for a site configuration',
    })
    id: AggregateId;

    @NonEmptyString({
        label: 'name',
        description: 'the name of this language hub configuration',
    })
    name: string;

    @NonEmptyString({
        label: 'site title',
        description: 'the Site Title for your language hub',
    })
    siteTitle: string;

    // TODO future-scoped: make all of these `MultilingualText`

    @NonEmptyString({
        label: 'subtitle',
        description: 'subtitle for your language hub',
    })
    subTitle: string; // ML Text

    @NonEmptyString({
        label: 'about',
        description: 'text for your about page',
    })
    about: string; // ML Text

    @NonEmptyString({
        label: 'should enable admin mode',
        description:
            'if true, the client will expose log in and command forms to authenticated admin users',
    })
    shouldEnableAdminMode: boolean;

    @NonEmptyString({
        label: 'site description',
        description: 'description for your language hub',
    })
    siteDescription: string; // ML Text

    @NonEmptyString({
        label: 'site home image url',
        description: 'a URL for the image to feature on your home page',
    })
    siteHomeImageUrl: string; // URL?

    @NonEmptyString({
        label: 'site favicon',
        description: 'the favicon for your site',
    })
    siteFavicon: string; // URL?

    @NonEmptyString({
        label: 'copyright holder',
        description: `the copyright holder for your site and the content in this COSCRAD instance's DB`,
    })
    copyrightHolder: string;

    @NonEmptyString({
        label: 'coscrad logo url',
        description: 'a link to the COSCRAD logo',
    })
    // TODO can't this be hardwired?
    coscradLogoUrl: string; // URL?

    @NonEmptyString({
        label: 'organization logo url',
        description: `link to your organization's logo`,
    })
    organizationLogoUrl: string; // URL?

    @NonEmptyString({
        label: 'index to detail flows',
        description: 'the record of index to detail flows for site navigation',
    })
    indexToDetailFlows: ResourceConfig[];

    // this should be part of the `IndexToDetailFlow` config
    @NonEmptyString({
        label: 'resource index label',
        description: 'the index label for resources',
    })
    resourceIndexLabel: string;

    // could this be part of a `WebOfKnowledgeConfig` class ?
    @NonEmptyString({
        label: 'should enable web of knowledge for resources',
        description: 'if true, notes and connections will be available in your language hub',
    })
    shouldEnableWebOfKnowledgeForResources: boolean;

    // eventually this will become a dynamic page
    @NonEmptyString({
        label: 'site credits',
        description: `a statement that acknowledges the general contributions of your team and knowledge keepers to the content available in your langauge hub`,
    })
    siteCredits: string; // ML Text? MLText with audio?

    // TODO Move this to the database \ back-end and enable it here by language code
    // TODO Decide how this connects to the `alphabet`
    // for now, make this a class `SimulatedKeyboard`. Export this from coscrad-nlp
    @NestedDataType(SimulatedKeyboard, {
        label: 'simulated keyboard',
        description:
            'character conversions table for implementing a virtual keyboard for diacritics',
    })
    simulatedKeyboard: SimulatedKeyboard;

    // make the following part of a `RadioStreamConfig` instead
    @NestedDataType(RadioStreamConfig, {
        label: 'listen live',
        description: 'radio stream configuration',
    })
    listenLive: RadioStreamConfig;

    //
    @NonEmptyString({
        label: 'not found message',
        description: 'the not found message for the radio stream',
    })
    notFoundMessage: string; // ML Text

    @NonEmptyString({
        label: 'loading message',
        description: 'the loading message for the radio stream',
    })
    loadingMessage: string; // ML Text

    // ThemeConfig
    @NestedDataType(ThemeOverrides, {
        label: 'theme overrides',
        description: 'MUI theme overrides',
    })
    themeOverrides: ThemeOverrides;

    // We may want a `LanguageConfig` in the future
    @ExternalEnum(
        {
            labelsAndValues: Object.entries(LanguageCode).map(([label, value]) => ({
                label,
                value,
            })),
            enumLabel: 'Language Code',
            enumName: 'LanguageCode',
        },
        {
            label: 'language code',
            description: 'technical specification of the format of the media item',
        }
    )
    defaultLanguageCode: LanguageCode;

    @NonEmptyString({
        label: 'phone number',
        description: 'phone number to contact manager of radio stream',
    })
    phoneNumber: string; // TODO PhoneNumber

    @NonEmptyString({
        label: 'email',
        description: 'email contact for manager of radio stream',
    })
    email: string; // TODO email?

    @NonEmptyString({
        label: 'address',
        description: 'address for radio stream',
    })
    address: string; // TODO address?

    @NestedDataType(InternalLink, {
        label: 'internal links',
        description: 'internal links',
    })
    internalLinks: InternalLink[];

    @NestedDataType(ExternalLink, {
        label: 'external links',
        description: 'external links',
    })
    externalLinks: ExternalLink[];

    @NestedDataType(SocialMediaLinkDirectory, {
        label: 'name',
        description: 'the name of the video',
    })
    socialMediaLinks: SocialMediaLinkDirectory;

    @NestedDataType(AlphabetConfig, {
        label: 'name',
        description: 'the name of the video',
    })
    alphabetConfig: AlphabetConfig;

    // In the near future, we'll add an `additional_materials` collection
    @NestedDataType(AdditionalMaterial, {
        label: 'additional materials',
        description: 'additional materials for the COSCRAD instance',
    })
    additionalMaterials: AdditionalMaterial[];

    /**
     * TODO In the long run, we should allow each feature module to append its
     * config in a plug-in style system.
     */
    // We should make these properties optional and disable the feature if the feature-specific config is missing
    @NestedDataType(MemoryMatchConfig, {
        label: 'name',
        description: 'the name of the video',
    })
    memoryMatch: MemoryMatchConfig;

    constructor(dto: DeepPartial<DTO<LanguageHubConfig>>) {
        if (!dto) return;

        const {
            name,
            siteTitle,
            subTitle,
            about,
            shouldEnableAdminMode,
            siteDescription,
            siteHomeImageUrl,
            siteFavicon,
            copyrightHolder,
            coscradLogoUrl,
            indexToDetailFlows,
            resourceIndexLabel,
            shouldEnableWebOfKnowledgeForResources,
            siteCredits,
            simulatedKeyboard,
            listenLive,
            notFoundMessage,
            loadingMessage,
            themeOverrides,
            defaultLanguageCode,
            phoneNumber,
            email,
            address,
            internalLinks,
            externalLinks,
            socialMediaLinks,
            alphabetConfig,
            additionalMaterials,
            memoryMatch,
        } = dto;

        this.name = name;

        this.siteTitle = siteTitle;

        this.subTitle = subTitle;

        this.about = about;

        this.shouldEnableAdminMode = shouldEnableAdminMode;

        this.siteDescription = siteDescription;

        this.siteHomeImageUrl = siteHomeImageUrl;

        this.siteFavicon = siteFavicon;

        this.copyrightHolder = copyrightHolder;

        this.coscradLogoUrl = coscradLogoUrl;

        if (Array.isArray(indexToDetailFlows)) {
            this.indexToDetailFlows = indexToDetailFlows.map((i) => new ResourceConfig(i));
        }

        this.resourceIndexLabel = resourceIndexLabel;

        this.shouldEnableWebOfKnowledgeForResources = shouldEnableWebOfKnowledgeForResources;

        this.siteCredits = siteCredits;

        if (isNonEmptyObject(simulatedKeyboard)) {
            this.simulatedKeyboard = new SimulatedKeyboard(
                simulatedKeyboard as DTO<SimulatedKeyboard>
            );
        }

        if (isNonEmptyObject(listenLive)) {
            this.listenLive = new RadioStreamConfig(listenLive as DTO<RadioStreamConfig>);
        }

        this.notFoundMessage = notFoundMessage;

        this.loadingMessage = loadingMessage;

        this.themeOverrides = new ThemeOverrides(themeOverrides as DTO<ThemeOverrides>);

        this.defaultLanguageCode = defaultLanguageCode;

        this.phoneNumber = phoneNumber;

        this.email = email;

        this.address = address;

        this.internalLinks = internalLinks.map((i) => new InternalLink(i as DTO<InternalLink>));

        this.externalLinks = externalLinks.map((e) => new ExternalLink(e as DTO<ExternalLink>));

        this.socialMediaLinks = new SocialMediaLinkDirectory(
            socialMediaLinks as DTO<SocialMediaLinkDirectory>
        );

        this.alphabetConfig = new AlphabetConfig(alphabetConfig as DTO<AlphabetConfig>);

        this.additionalMaterials = additionalMaterials.map(
            (a) => new AdditionalMaterial(a as DTO<AdditionalMaterial>)
        );

        this.memoryMatch = new MemoryMatchConfig(memoryMatch as DTO<MemoryMatchConfig>);
    }

    validateInvariants(): InternalError[] {
        const simpleValidationResult = validateSimpleInvariants(
            Object.getPrototypeOf(this).constructor,
            this
        );

        if (simpleValidationResult.length > 0) {
            return simpleValidationResult;
        }
    }

    public static fromCreationDto(id: AggregateId, dto: SiteConfigCreationDto) {
        const {
            name,
            siteTitle,
            subTitle,
            about,
            shouldEnableAdminMode,
            siteDescription,
            siteHomeImageUrl,
            siteFavicon,
            copyrightHolder,
            coscradLogoUrl,
            indexToDetailFlows,
            resourceIndexLabel,
            shouldEnableWebOfKnowledgeForResources,
            siteCredits,
            simulatedKeyboard,
            listenLive,
            notFoundMessage,
            loadingMessage,
            themeOverrides,
            defaultLanguageCode,
            phoneNumber,
            email,
            address,
            internalLinks,
            externalLinks,
            socialMediaLinks,
            alphabetConfig,
            additionalMaterials,
            memoryMatch,
        } = dto;

        return new LanguageHubConfig({
            name,
            siteTitle,
            subTitle,
            about,
            shouldEnableAdminMode,
            siteDescription,
            siteHomeImageUrl,
            siteFavicon,
            copyrightHolder,
            coscradLogoUrl,
            indexToDetailFlows,
            resourceIndexLabel,
            shouldEnableWebOfKnowledgeForResources,
            siteCredits,
            simulatedKeyboard,
            listenLive,
            notFoundMessage,
            loadingMessage,
            themeOverrides,
            defaultLanguageCode,
            phoneNumber,
            email,
            address,
            internalLinks,
            externalLinks,
            socialMediaLinks,
            alphabetConfig,
            additionalMaterials,
            memoryMatch,
        });
    }

    public static fromDto(dto: DTO<LanguageHubConfig>) {
        return new LanguageHubConfig(dto);
    }

    toDTO(): DTO<LanguageHubConfig> {
        return cloneToPlainObject(this);
    }
}
