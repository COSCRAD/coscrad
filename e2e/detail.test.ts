import { by, device, element, expect } from 'detox';

describe('Detail', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should display detail screen', async () => {
        await element(by.id('Menu')).tap();
        await element(by.id('Detail')).tap();
        await expect(element(by.id('Detail'))).toBeVisible();
    });

    it('should change index when pressing Next button', async () => {
        await element(by.id('Menu')).tap();
        await element(by.id('Detail')).tap();
        await element(by.id('Next')).tap();
        await expect(element(by.id('2'))).toBeVisible();
    });
});
