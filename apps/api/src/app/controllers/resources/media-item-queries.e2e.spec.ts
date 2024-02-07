describe('when querying for a media item by name (/resources/mediaItems/download?name=foo)', () => {
    describe(`when the media item does not exist`, () => {
        it.todo('should return a 400');
    });

    describe(`when the media item exists`, () => {
        describe(`when the user is not logged in`, () => {
            describe(`when the media item is published`, () => {
                it.todo(`should return the expected binary`);
            });

            describe(`when the media item is not published`, () => {
                it.todo(`should return not found`);
            });

            describe(`when the name parameter is invalidly formatted`, () => {
                it.todo(`should return a 400 (user error)`);
            });
        });

        describe(`when the user is authenticated as....`, () => {
            it.todo(`similar test cases, please`);
        });
    });
});
