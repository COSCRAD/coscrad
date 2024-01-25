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
});
