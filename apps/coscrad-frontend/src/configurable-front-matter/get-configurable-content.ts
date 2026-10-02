import { LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import {
    isBoolean,
    isNonEmptyObject,
    isNonEmptyString,
    isNullOrUndefined,
    isObject,
    isURL,
} from '@coscrad/validation-constraints';
import {
    AdditionalMaterialItem,
    ConfigurableContent,
    ExternalLink,
    InternalLink,
    MemoryMatchConfig,
} from './data/configurable-content-schema';

type UnvalidatedContentConfig = {
    [K in keyof ConfigurableContent]?: unknown;
};

const isLanguageCode = (input: unknown): input is LanguageCode =>
    Object.values(LanguageCode).some((lc) => lc === (input as LanguageCode));

const isMimeType = (input: unknown): input is MIMEType =>
    Object.values(MIMEType).includes(input as MIMEType);

export const getConfigurableContent = (): ConfigurableContent => {
    // @ts-expect-error We don't need type safety here as we validate the incoming data below.
    const dynamicConfig = window.APP_CONFIG || ({} as UnvalidatedContentConfig);

    const errors: Error[] = [];

    /**
     * We could use our schema-based validation, but decorators aren't supported
     * in our front-end build. Further, we anticipate moving most of this state
     * to the database with dynamic validation in the near future.
     */
    if (!isNonEmptyString(dynamicConfig.siteTitle)) {
        errors.push(new Error(`Invalid config: **siteTitle** must contain non-empty text.`));
    }

    if (!isNonEmptyString(dynamicConfig.subTitle)) {
        errors.push(new Error(`Invalid config: **subTitle** must contain non-empty text.`));
    }

    if (!isNullOrUndefined(dynamicConfig.about) && !isNonEmptyString(dynamicConfig.about)) {
        errors.push(
            new Error(`Invalid config: **about** must contain non-empty text if provided.`)
        );
    }

    if (!isBoolean(dynamicConfig.shouldEnableAdminMode)) {
        errors.push(
            new Error(`Invalid config: **shouldEnableAdminMode** must be a boolean (true | false).`)
        );
    }

    if (!isNonEmptyString(dynamicConfig.siteDescription)) {
        errors.push(new Error(`Invalid config: **siteDescription** must contain non-empty text.`));
    }

    if (!isURL(dynamicConfig.siteHomeImageUrl)) {
        errors.push(new Error(`Invalid config: **siteHomeImageUrl** must be a valid URL.`));
    }

    if (!isURL(dynamicConfig.siteFavicon)) {
        errors.push(new Error(`Invalid config: **siteFavicon** must be a valid URL.`));
    }

    if (
        !isNullOrUndefined(dynamicConfig.copyrightHolder) &&
        !isNonEmptyString(dynamicConfig.copyrightHolder)
    ) {
        errors.push(
            new Error(
                `Invalid config: **copyrightHolder** must contain non-empty text if provided.`
            )
        );
    }

    if (!isURL(dynamicConfig.coscradLogoUrl)) {
        errors.push(new Error(`Invalid config: **coscradLogoUrl** must be a valid URL.`));
    }

    if (!isURL(dynamicConfig.organizationLogoUrl)) {
        errors.push(new Error(`Invalid config: **organizationLogoUrl** must be a valid URL.`));
    }

    if (!isBoolean(dynamicConfig.shouldEnableWebOfKnowledgeForResources)) {
        errors.push(
            new Error(
                `Invalid config: **shouldEnableWebOfKnowledgeForResources** must be a boolean (true|false).`
            )
        );
    }

    if (!isNonEmptyString(dynamicConfig.siteCredits)) {
        errors.push(new Error(`Invalid config: **siteCredits** must contain non-empty text.`));
    }

    if (!isNonEmptyString(dynamicConfig.notFoundMessage)) {
        errors.push(new Error(`Invalid config: **notFoundMessage** must contain non-empty text.`));
    }

    if (!isNonEmptyString(dynamicConfig.loadingMessage)) {
        errors.push(new Error(`Invalid config: **loadingMessage** must contain non-empty text.`));
    }

    // TODO we need to validate theme overrides carefully
    if (
        !isNullOrUndefined(dynamicConfig.themeOverrides) &&
        !isNonEmptyObject(dynamicConfig.themeOverrides)
    ) {
        errors.push(
            new Error(`Invalid config: **themeOverrides** must be a non-empty object if provided.`)
        );
    }

    if (!isNonEmptyString(dynamicConfig.resourceIndexLabel)) {
        errors.push(
            new Error(`Invalid config: **resourceIndexLabel** must contain non-empty text.`)
        );
    }

    if (!isLanguageCode(dynamicConfig.defaultLanguageCode)) {
        errors.push(
            new Error(
                `Invalid config: **defaultLanguageCode** must contain a valid language code (received: ${dynamicConfig.defaultLanguageCode})`
            )
        );
    }

    // TODO should we validate this more carefully?
    // TODO shouldn't this be optional?
    if (!isNonEmptyString(dynamicConfig.phoneNumber)) {
        errors.push(new Error(`Invalid config: missing or misformatted **phoneNumber**.`));
    }

    if (!isNonEmptyString(dynamicConfig.email)) {
        errors.push(new Error(`Invalid config: missing or misformatted **email**`));
    }

    if (!isNonEmptyString(dynamicConfig.address)) {
        errors.push(new Error(`Invalid config: missing or misformatted **address*`));
    }

    if (!Array.isArray(dynamicConfig.internalLinks)) {
        errors.push(new Error(`Invalid config: **internalLinks** must be an array.`));
    } else {
        const internalLinkErrors: Error[] = [];

        (dynamicConfig.internalLinks as unknown[]).forEach((internalLink, index) => {
            if (!isNonEmptyObject(internalLink)) {
                internalLinkErrors.push(
                    new Error(`Invalid config: **internalLinks[${index}]** must be an object.`)
                );

                return;
            }

            const { url, iconUrl, description } = internalLink as InternalLink;

            if (!isURL(url)) {
                errors.push(
                    new Error(`Invalid config: **internalLinks[${index}].url** must be a URL.`)
                );
            }

            if (!isURL(iconUrl)) {
                errors.push(
                    new Error(`Invalid config: **internalLinks[${index}].iconUrl** must be a URL.`)
                );
            }

            if (!isNonEmptyString(description)) {
                errors.push(
                    new Error(
                        `Inivalid config: **internalLinks[${index}].description** must contain non-empty text.`
                    )
                );
            }
        });

        if (internalLinkErrors.length > 0) {
            errors.push(...internalLinkErrors);
        }
    }

    if (!Array.isArray(dynamicConfig.externalLinks)) {
        errors.push(new Error(`Invalid config: **externalLinks** must be an array.`));
    } else {
        const externalLinkErrors: Error[] = [];

        dynamicConfig.externalLinks.forEach((externalLink, index) => {
            if (!isNonEmptyObject(externalLink)) {
                errors.push(
                    new Error(`Invalid config: **externalLink[${index}]** must be an object.`)
                );

                return;
            }

            const { title, url, description } = externalLink as ExternalLink;

            if (!isNonEmptyString(title)) {
                errors.push(
                    new Error(
                        `Invalid config: **externalLinks[${index}].title** must contain non-empty text.`
                    )
                );
            }

            if (!isURL(url)) {
                errors.push(
                    new Error(
                        `Invalid config: **externalLinks[${index}].url** must be a valid URL.`
                    )
                );
            }

            if (!isNonEmptyString(description)) {
                errors.push(
                    new Error(
                        `Invalid config: **externalLinks[${index}].description** must contain non-empty text.`
                    )
                );
            }
        });

        if (externalLinkErrors.length > 0) {
            errors.push(...externalLinkErrors);
        }
    }

    if (!isObject(dynamicConfig.socialMediaLinks)) {
        errors.push(
            new Error(
                `Invalid config: **socialMediaLinks** must be an option (although it may be empty).`
            )
        );
    } else {
        const { facebook, twitter, github, youtube, instagram } = dynamicConfig.socialMediaLinks;

        const socialMediaLinkErrors = [facebook, twitter, github, youtube, instagram].flatMap(
            (socialMediaLink) => {
                if (isNullOrUndefined(socialMediaLink)) {
                    // these are all optional properties
                    return [];
                }

                if (!isURL(socialMediaLink)) {
                    return [
                        new Error(
                            `Invalid config: **socialMediaLinks.${socialMediaLink}** must be a valid URL.`
                        ),
                    ];
                }
            }
        );

        if (socialMediaLinkErrors.length > 0) {
            errors.push(...socialMediaLinkErrors);
        }

        if (!isBoolean(dynamicConfig.shouldEnableMemoryMatch)) {
            errors.push(
                new Error(
                    `Invalid config: **shouldEnableMemoryMatch** must be a boolean (true|false).`
                )
            );
        }
    }

    if (!Array.isArray(dynamicConfig.additionalMaterials)) {
        errors.push(new Error(`Invalid config: **additionalMaterials** must be an array.`));
    } else {
        const additionalMaterialErrors = dynamicConfig.additionalMaterials.flatMap(
            (additionalMaterialItem: AdditionalMaterialItem, index: number) => {
                if (!isNonEmptyObject(additionalMaterialItem)) {
                    return [
                        new Error(
                            `Invalid config: **addtionalMaterials[${index}]** must be a non-empty object`
                        ),
                    ];
                }

                const { pdf, media } = additionalMaterialItem as AdditionalMaterialItem;

                if (!isNonEmptyObject(pdf) && !isNonEmptyObject(media)) {
                    return [
                        new Error(
                            `Invalid config: **additionalMaterials[${index}]** must include at least one of [pdf, media].`
                        ),
                    ];
                }

                const nestedMaterialErrors: Error[] = [];

                if (isNonEmptyObject(pdf)) {
                    const { url, name, description } = pdf;

                    if (!isURL(url)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].pdf.url** must be a valid URL.`
                            )
                        );
                    }

                    if (!isNonEmptyObject(name)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].pdf.name** must contain non-empty text.`
                            )
                        );
                    }

                    if (!isNonEmptyString(description)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].pdf.description** must contain non-empty text.`
                            )
                        );
                    }
                }

                if (isNonEmptyObject(media)) {
                    const { url, mimeType, name, description } = media;

                    if (!isURL(url)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].media.url** must be a valid URL.`
                            )
                        );
                    }

                    // TODO change this to audio or video MIME type
                    if (!isMimeType(mimeType)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].media.mimeType** must be a valid MIME type`
                            )
                        );
                    }

                    if (!isNonEmptyString(name)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].media.name** must contain non-empty text.`
                            )
                        );
                    }

                    if (!isNonEmptyString(description)) {
                        nestedMaterialErrors.push(
                            new Error(
                                `Invalid config: **additionalMaterials[${index}].media.descsription** must contain non-empty text.`
                            )
                        );
                    }
                }

                return nestedMaterialErrors;
            }
        );

        // TODO is the condition necessary here?
        if (additionalMaterialErrors.length > 0) {
            errors.push(...additionalMaterialErrors);
        }
    }

    if (!isNonEmptyObject(dynamicConfig.memoryMatch)) {
        errors.push(new Error(`Invalid config: **memoryMatch** must be a non-empty object.`));
    } else {
        const { isEnabled } = dynamicConfig.memoryMatch as MemoryMatchConfig;

        if (!isBoolean(isEnabled)) {
            errors.push(
                new Error(
                    `Invalid config: **memoryMatch.isEnabled** must be a boolean (true|false).`
                )
            );
        }
    }

    if (errors.length > 0) {
        throw new Error(`Invalid config [content.config.js].\n${errors.join('\n')}`);
    }

    // TODO use a better pattern such as `clonePlainObjectWithOverrides`
    const contentConfig: ConfigurableContent = {
        indexToDetailFlows: dynamicConfig?.indexToDetailFlows || [],
        siteTitle: dynamicConfig.siteTitle,
        subTitle: dynamicConfig.subTitle,
        about: dynamicConfig.about || '',
        shouldEnableAdminMode: dynamicConfig.shouldEnableAdminMode,
        siteDescription: dynamicConfig.siteDescription,
        siteHomeImageUrl: dynamicConfig.siteHomeImageUrl,
        siteFavicon: dynamicConfig.siteFavicon,
        copyrightHolder: dynamicConfig.copyrightHolder || '',
        coscradLogoUrl: dynamicConfig.coscradLogoUrl,
        organizationLogoUrl: dynamicConfig.organizationLogoUrl,
        shouldEnableWebOfKnowledgeForResources:
            dynamicConfig.shouldEnableWebOfKnowledgeForResources,
        siteCredits: dynamicConfig.siteCredits,
        notFoundMessage: dynamicConfig.notFoundMessage,
        loadingMessage: dynamicConfig.loadingMessage,
        themeOverrides: dynamicConfig.themeOverrides || {},
        resourceIndexLabel: dynamicConfig.resourceIndexLabel,
        defaultLanguageCode: dynamicConfig.defaultLanguageCode,
        phoneNumber: dynamicConfig.phoneNumber,
        email: dynamicConfig.email,
        address: dynamicConfig.address,
        internalLinks: dynamicConfig.internalLinks,
        externalLinks: dynamicConfig.externalLinks,
        socialMediaLinks: dynamicConfig.socialMediaLinks,
        shouldEnableMemoryMatch: dynamicConfig.shouldEnableMemoryMatch,
        additionalMaterials: dynamicConfig.additionalMaterials,
        memoryMatch: {
            isEnabled: false,
        },
    };

    /**
     * Note that we used to validate the content config when it was JSON. This is no
     * longer necessary, as it is now a TypeScript file.
     */

    return contentConfig as unknown as ConfigurableContent;
};
