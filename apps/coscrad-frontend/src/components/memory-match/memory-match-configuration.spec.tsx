import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { MemoryMatchIndexPage } from '../games/memory-match/memory-match-index.page';

describe(`memory match config`, () => {
    describe(`when the memory match round is not enabled`, () => {
        const notFoundMessage = 'No Rounds Have Been Found';

        const testContentConfig = getDummyConfigurableContent({
            memoryMatch: {
                isEnabled: false,
            },
            notFoundMessage,
        });

        it(`should display the fallback message`, () => {
            renderWithProviders(
                <MemoryRouter>
                    <MemoryMatchIndexPage />
                </MemoryRouter>,
                { contentConfig: testContentConfig }
            );

            const searchPattern = new RegExp(notFoundMessage);

            const screenRes = screen.getByText(searchPattern);

            expect(screenRes).toBeTruthy();
        });
    });
});
