describe(`MemoryMatchRound`, () => {
    describe(`addImageForCard`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should add the image to the card`);
        });

        describe(`when the update is invalid`, () => {
            describe(`when the card already has a image`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`addAudioForCard`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should add the audio`);
        });

        describe(`when the update is invalid`, () => {
            describe(`when there is already audio for the card`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`addTextForCard`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should add the text`);
        });

        describe(`when the update is invalid`, () => {
            describe(`when the card already has original text`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`addCard`, () => {
        describe(`when the update is valid`, () => {
            describe(`when the round doesn't have any cards`, () => {
                it.todo(`should add a new card with the expected sequenece number`);
            });

            describe(`when the round has one card`, () => {
                it.todo(`should add a new card with the expected sequenece number`);
            });

            describe(`when the round has one less than a full set of cards`, () => {
                it.todo(`should add a new card with the expected sequenece number`);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the round already has the maximum number of cards`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`publish`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should update the round's publication status`);
        });

        describe(`when the update is invalid`, () => {
            it.todo(`should have test cases`);
        });
    });

    describe(`unpublish`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should update the publication status`);
        });

        describe(`when the update is invalid`, () => {
            describe(`when the round is not published to begin with`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });
});
