describe(`JournalArticleBibliographicCitation.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when there is a creation event`, () => {
            it.todo(
                `should return a Journal Article Bibliographic Citation with the expected state`
            );
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given Journal Article Bibliographic Citation`, () => {
            it.todo(`should return Not Found`);
        });

        describe(`when the creation event is missing`, () => {
            it.todo(`should throw`);
        });

        // This could happen if we change our invariant rules or botch event versioning
        describe(`when there is a creation event with invalid data`, () => {
            it.todo(`should return an invariant validation error`);
        });
    });
});
