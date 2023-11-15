import { device } from 'detox';

describe('Credits', () => {
    beforeEach(async () => {
        await device.launchApp();
    });

    it('should display Credits', async () => {
        await expect(element(by.text('Credits'))).toBe;
    });
});
