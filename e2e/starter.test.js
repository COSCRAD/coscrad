describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.id('Home'))).toBeVisible();
  });

  it('should show credits screen after pressing credits button', async () => {
    await element(by.id('Credits')).tap();
    await expect(element(by.text('Credits'))).toBeVisible();
  });

});
