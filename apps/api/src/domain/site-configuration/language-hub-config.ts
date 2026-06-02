import { ExternalEnum, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RadioStreamConfig } from './radio-stream-config';
import { ThemeOverrides } from './types/theme-overrides';
import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalLink } from './internal-link';
import { ExternalLink } from './external-link';
import { SocialMediaLinkDirectory } from './social-media-link-directory';
import { AlphabetConfig } from './alphabet-config';
import { MemoryMatchConfig } from './memory-match-config';
import { AdditionalMaterial } from './additional-material';

class LanguageHubConfig {
    @NonEmptyString({
        label: 'site title',
        description: 'the Site Title for this COSCRAD instance'
    })
    siteTitle: string;

    // TODO future-scoped: make all of these `MultilingualText`
    
    @NonEmptyString({
        label: 'subtitle',
        description: 'subtitle for the site for this COSCRAD instance'
    })
    subTitle: string; // ML Text
  
    @NonEmptyString({
        label: 'about',
        description: 'about this COSCRAD instance'
    })
    about: string; // ML Text
  
    @NonEmptyString({
        label: 'should enable admin mode',
        description: 'boolean for enabling admin mode for this COSCRAD instance'
    })
    shouldEnableAdminMode: boolean;
  
    @NonEmptyString({
        label: 'site description',
        description: 'description for the site for this COSCRAD instance'
    })
    siteDescription: string; // ML Text
  
    @NonEmptyString({
        label: 'site home image url',
        description: 'the url for the home page of this COSCRAD instance'
    })
    siteHomeImageUrl: string; // URL?
  
    @NonEmptyString({
        label: 'site favicon',
        description: 'the favicon for the site for this COSCRAD instance'
    })
    siteFavicon: string; // URL?
  
    @NonEmptyString({
        label: 'copyright holder',
        description: 'the copyright holder for this COSCRAD instance'
    })
    copyrightHolder: string;
  
    @NonEmptyString({
        label: 'coscrad logo url',
        description: 'the url source for the logo for this COSCRAD instance'
    })
    coscradLogoUrl: string; // URL?
  
    @NonEmptyString({
        label: 'organization logo url',
        description: 'the url source for the organization logo for this COSCRAD instance'
    })
    organizationLogoUrl: string; // URL?

  // you need a separate `IndexToDetailFlowConfig` class 
    @NonEmptyString({
        label: 'index to detail flows',
        description: 'the record of index to detail flows for site navigation'
    })
    indexToDetailFlows: Record<CategorizableType,IndexToDetailFlowConfig | null>; // or a map?

  // could this be part of a `WebOfKnowledgeConfig` class ?
    @NonEmptyString({
        label: 'should enable web of knowledge for resources',
        description: 'boolean for enabling the web of knowledge connections for this COSCRAD instance'
    })
    shouldEnableWebOfKnowledgeForResources: boolean;

  // eventually this will become a dynamic page
    @NonEmptyString({
        label: 'site credits',
        description: 'the credits for this COSCRAD instance'
    })
    siteCredits: string; // ML Text? MLText with audio?
  
    // TODO Move this to the database \ back-end and enable it here by language code
    // TODO Decide how this connects to the `alphabet`
    // for now, make this a class `SimulatedKeyboard`. Export this from coscrad-nlp
    @NestedDataType(SimulatedKeyboard, {
        label: 'simulated keyboard',
        description: 'character conversions table for implementing a virtual keyboard for diacritics'
    })
    simulatedKeyboard: {
        name: 'Tŝilhqot’in',
        specialCharacterReplacements: {
            's[': `C + \u015d`,
            'S[': `C + \u015c`,
            'w[': `C + \u0175`,
            'W[': `C + \u0174`,
            'z[': `C + \u1e91`,
            'Z[': `C + \u1e90`,
            // These have only a single code point representation
            ']': 'ʔ',
            ';': 'ɨ',
            "'": '’',
        },
    }

  // make the following part of a `RadioStreamConfig` instead
    @NestedDataType(RadioStreamConfig, {
        label: 'listen live',
        description: 'radio stream configuration'
    })
    listenLive: RadioStreamConfig;

  // 
    @NonEmptyString({
        label: 'not found message',
        description: 'the not found message for the radio stream'
    })
    notFoundMessage: string; // ML Text
  
    @NonEmptyString({
        label: 'loading message',
        description: 'the loading message for the radio stream'
    })
    loadingMessage: string; // ML Text

  // ThemeConfig
  @NestedDataType(ThemeOve, {
    label: 'theme overrides',
    description: 'MUI theme overrides'
  })  
  themeOverrides: ThemeOverrides

  // this should be part of the `IndexToDetailFlow` config
    @NonEmptyString({
        label: 'site',
        description: 'akfsjldfjs'
    })
    resourceIndexLabel: string;

  // We may want a `LanguageConfig` in the future
    @ExternalEnum(
        {
            labelsAndValues: Object.entries(LanguageCode).map(([label, value]) => ({ label, value })),
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
        description: 'phone number to contact manager of radio stream'
    })
    phoneNumber: string; // TODO PhoneNumber

    @NonEmptyString({
        label: 'email',
        description: 'email contact for manager of radio stream'
    })
    email: string; // TODO email?

    @NonEmptyString({
        label: 'address',
        description: 'address for radio stream'
    })
    address: string; // TODO address?

    
    @NestedDataType(InternalLink{
        label: 'internal links',
        description: 'internal '
    })
    internalLinks: InternalLink[];

    @NestedDataType(ExternalLink{
        label: 'internal links',
        description: 'internal '
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
    additionalMaterials: AdditionalMaterial[]
  
    @NestedDataType(MemoryMatchConfig, {
        label: 'name',
        description: 'the name of the video',
    })
    memoryMatch: MemoryMatchConfig;
}