import { by, device, element, expect } from 'detox';

describe('Detail', () => {
    describe('when all media is available', () => {
        beforeEach(async () => {
            await device.launchApp({
                launchArgs: {
                    configOverrides: {
                        config: {
                            env: {
                                TARGET_ALPHABET_NAME: `alphabet-english`,
                                BASE_API_URL: `http://10.0.2.2:3131/api`,
                            },
                        },
                    },
                },
            });
            await device.reloadReactNative();

            await element(by.id('Menu')).tap();
            await element(by.id('AlphabetDetailLinkButton')).tap();
        });

        afterAll(async () => {
            await device.terminateApp();
        });

        it('should display detail screen', async () => {
            await expect(element(by.id('AlphabetCardDetail'))).toBeVisible();
        });

        it('should change index when pressing Next button', async () => {
            await element(by.id('Next')).tap();
            await expect(element(by.id('AlphabetCardDetail/2'))).toBeVisible();
        });
        it('should display the correct word when clicking next', async () => {
            await element(by.id('Next')).multiTap(3);
            await expect(element(by.id('deer'))).toBeVisible();
        });

        it('should display correct letter when clicking next', async () => {
            await element(by.id('Next')).multiTap(8);
            await expect(element(by.id('i'))).toBeVisible();
        });

        it('should display the correct when clicking back', async () => {
            await element(by.id('Back')).multiTap(3);
            await expect(element(by.id('xylophone'))).toBeVisible();
        });

        it('should roll over when the end of the alphabet is reached', async () => {
            //this lines up with fixture data
            const alphabetLength = 26;

            await element(by.id('Next')).multiTap(26);
            await expect(element(by.id('apple'))).toBeVisible();
        });

        it('should display the word audio play button', async () => {
            await element(by.id('w1.mp3')).tap();
            await expect(element(by.id('w1.mp3'))).toBeVisible();
        });

        it('should display a loaded image', async () => {
            await expect(element(by.id('loadedImage'))).toBeVisible();
        });
    });
});

describe('Detail with error', () => {
    describe('when a media link is broken', () => {
        beforeEach(async () => {
            await device.launchApp({
                launchArgs: {
                    configOverrides: {
                        config: {
                            env: {
                                TARGET_ALPHABET_NAME: `broken-media-links`,
                                BASE_API_URL: `http://10.0.2.2:3131/BROKEN-API`,
                            },
                        },
                    },
                },
            });
            await device.reloadReactNative();

            await element(by.id('Menu')).tap();
            await element(by.id('AlphabetDetailLinkButton')).tap();
        });

        it('should display an error message if there is a word audio error', async () => {
            await expect(element(by.id('wordAudioError'))).toBeVisible();
        });

        it('should display an error message if there is a letter audio error', async () => {
            await expect(element(by.id('letterAudioError'))).toBeVisible();
        });

        it('should display an error message if an image is not loaded', async () => {
            await expect(element(by.id('imageError'))).toBeVisible();
        });
    });
});
