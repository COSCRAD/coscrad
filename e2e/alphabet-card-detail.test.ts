import { by, device, element, expect } from 'detox';

interface ITappableAsync {
    tap(): Promise<void>;
}

const multiTap = async (tappable: ITappableAsync, numberOfTaps: number): Promise<void> => {
    for (let _i of Array(numberOfTaps)
        .fill(0)
        .map((_, index) => index)) {
        await tappable.tap();
    }
};

const BROKEN_API_URL = `http://10.0.2.2:3131/BROKEN-API`;

const BROKEN_ALPHABET_NAME = `broken-media-links`;

describe('Detail', () => {
    beforeEach(async () => {
        await device.launchApp();

        await device.reloadReactNative();

        await element(by.id('Menu')).tap();
        await element(by.id('AlphabetDetailLinkButton')).tap();
    });

    afterAll(async () => {
        await device.terminateApp();
    });

    describe('when all media is available', () => {
        it('should display the correct word when clicking next', async () => {
            await multiTap(element(by.id('Next')), 3);

            await expect(element(by.id('deer'))).toBeVisible();
        });

        it('should display detail screen', async () => {
            await expect(element(by.id('AlphabetCardDetail'))).toBeVisible();
        });

        it('should change index when pressing Next button', async () => {
            await element(by.id('Next')).tap();
            await expect(element(by.id('AlphabetCardDetail/2'))).toBeVisible();
        });

        it('should display correct letter when clicking next', async () => {
            await multiTap(element(by.id('Next')), 8);

            await expect(element(by.id('i'))).toBeVisible();
        });

        it('should display the correct when clicking back', async () => {
            await multiTap(element(by.id('Back')), 3);

            await expect(element(by.id('xylophone'))).toBeVisible();
        });

        it('should roll over when the end of the alphabet is reached', async () => {
            //this lines up with fixture data
            await multiTap(element(by.id('Next')), 26);

            await expect(element(by.id('apple'))).toBeVisible();
        });

        it('should display the audio play button', async () => {
            waitFor(element(by.id('appAudioPlayer'))).toBeVisible();
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
                                TARGET_ALPHABET_NAME: BROKEN_ALPHABET_NAME,
                                BASE_API_URL: BROKEN_API_URL,
                            },
                        },
                    },
                },
            });

            await device.reloadReactNative();

            await element(by.id('Menu')).tap();
            await element(by.id('AlphabetDetailLinkButton')).tap();
        });

        it('should display an error message if an image is not loaded', async () => {
            await expect(element(by.id('imageError'))).toBeVisible();
        });

        it('should display an error message if there is an letter audio error', async () => {
            await expect(element(by.id('audioError')).atIndex(0)).toBeVisible();
            await expect(element(by.text('Error loading Play Letter audio'))).toBeVisible();
        });
        it('should display an error message if there is an word audio error', async () => {
            await expect(element(by.id('audioError')).atIndex(0)).toBeVisible();
            await expect(element(by.text('Error loading Play Word audio'))).toBeVisible();
        });
    });
});
