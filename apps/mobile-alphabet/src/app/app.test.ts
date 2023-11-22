import '@testing-library/jest-dom';
import { device } from 'detox';

describe('Credits', () => {
    beforeEach(async () => {
        await device.launchApp();
    });

    it('should display Credits', async () => {
        expect(element(by.text('Credits'))).toBeVisible();
    });
});
