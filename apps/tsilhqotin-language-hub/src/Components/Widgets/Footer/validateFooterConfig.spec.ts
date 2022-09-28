import { FooterConfig, SocialMediaLink } from './footer.config';
import { validateFooterConfig } from './validateFooterConfig';

describe('validateFooterConfig', () => {
    const validSocialMediaLink: SocialMediaLink = {
        platform: 'facebook',
        url: 'https://facebook.com',
    };

    const validConfig: FooterConfig = {
        parentOrganization: 'acme',
        parentOrganizationWebLogoUrl: 'https://web.ca/logo',
        parentOrganizationSecondaryWebLogoUrl: 'https://web.ca/secondarylogo',
        socialMediaLinks: [validSocialMediaLink],
    };

    describe('when the config is valid', () => {
        it('should return no errors', () => {
            const result = validateFooterConfig(validConfig);
            expect(result).toEqual([]);
        });
    });

    describe('when the config is invalid', () => {
        describe('when the config is undefined', () => {
            const invalidConfig = undefined;

            it('should return an error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when the config is null', () => {
            const invalidConfig = null;

            it('should return an error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when parentOrganization is null', () => {
            const invalidConfig = {
                ...validConfig,
                parentOrganization: null,
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when parentOrganizationWebLogoUrl is an empty string', () => {
            const invalidConfig = {
                ...validConfig,
                parentOrganizationWebLogoUrl: '',
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when parentOrganizationSecondaryWebLogoUrl is a number', () => {
            const invalidConfig = {
                ...validConfig,
                parentOrganizationSecondaryWebLogoUrl: 5,
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when socialMediaLinks is null', () => {
            const invalidConfig = {
                ...validConfig,
                socialMediaLinks: null,
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when socialMediaLinks is undefined', () => {
            const invalidConfig = {
                ...validConfig,
                socialMediaLinks: undefined,
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when socialMediaLinks.platform is undefined', () => {
            const invalidConfig = {
                ...validConfig,
                socialMediaLinks: [
                    {
                        ...validSocialMediaLink,
                        platform: undefined,
                    },
                ],
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when socialMediaLinks.url is a number', () => {
            const invalidConfig = {
                ...validConfig,
                socialMediaLinks: [
                    {
                        ...validSocialMediaLink,
                        url: 9,
                    },
                ],
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        describe('when socialMediaLinks is not an array', () => {
            const invalidConfig = {
                ...validConfig,
                socialMediaLinks: 2,
            };

            it('should return the correct error', () => {
                const result = validateFooterConfig(invalidConfig);

                expect(result).toBeInstanceOf(Array);

                expect((result as Error[])[0]).toBeInstanceOf(Error);
            });
        });

        //check 164 to 177
    });
});
