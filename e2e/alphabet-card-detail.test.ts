import { by, device, element, expect } from 'detox';

describe('Detail', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        await element(by.id('Menu')).tap();
        await element(by.id('AlphabetDetailLinkButton')).tap();
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

    //TODO create a test for error handling if audio is not available
});
