import { render } from '@testing-library/react';

// Build a bogus data type and a widget that uses this type, put all null, undefined, etc.

describe('MultiplePropertyPresenter', () => {
    describe('when a bibliographic reference is passed in', () => {
        it('should display each of the properties present on the keysAndLabels object', () => {
            const { queryByLabelText, getByLabelText } = render(
                <div></div>
                // <MultiplePropertyPresenter
                //     keysAndLabels={bibliographicReferenceKeysAndLabels}
                //     data={dummyData}
                // />
            );
        });
    });
});
