import { by, device, element, expect } from 'detox';

describe('Menu', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should display menu screen', async () => {
        await expect(element(by.id('Menu'))).toBeVisible();
    });

    it('should show menu screen after pressing menu button', async () => {
        await element(by.id('Menu')).tap();
        expect(element(by.text('Menu'))).toBeVisible();
    });
});
