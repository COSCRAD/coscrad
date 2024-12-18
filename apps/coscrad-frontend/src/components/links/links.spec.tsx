import { screen } from '@testing-library/react';
import { ExternalLink } from '../../configurable-front-matter/data/configurable-content-schema';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { Links } from './links';

describe('Links', () => {
    describe(`when one or more links is provided`, () => {
        const dummyConfigurableContent = getDummyConfigurableContent();

        it('should load the external links configurable content', () => {
            const dummyDescription = 'This is a good textbook about the language.';

            const dummyUrl = 'https://www.tsilhqotinlanguage.ca';

            const linkToFind: ExternalLink = {
                description: dummyDescription,
                url: dummyUrl,
                title: 'my link',
            };

            const externalLinks: ExternalLink[] = [
                linkToFind,
                {
                    description: 'another link',
                    url: 'https://www.coscrad.org',
                    title: 'my link',
                },
            ];

            const myConfigurableContent = { ...dummyConfigurableContent, externalLinks };

            renderWithProviders(<Links />, {
                contentConfig: myConfigurableContent,
            });

            const searchPattern = new RegExp(dummyDescription);
            const screenRes = screen.getByText(searchPattern);

            expect(screenRes).toBeTruthy();

            // TODO assert the link exists

            // TODO assert the correct number of links are created
        });
    });
});
