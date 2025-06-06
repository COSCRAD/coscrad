import { screen } from '@testing-library/react';

import { MIMEType } from '@coscrad/api-interfaces';
import { AdditionalMaterialItem } from '../../configurable-front-matter/data/configurable-content-schema';
import { assertNotFound, renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { AdditionalMaterials } from './additional-materials';

describe(`Additional Materials`, () => {
    describe(`when additional materials are provided in the content config`, () => {
        describe(`when media is omitted`, () => {
            it(`should display the pdf`, () => {
                const dummyConfigurableContent = getDummyConfigurableContent();

                const testPdf = 'foo.pdf';

                const testPdfName = 'transcript';

                const testPdfDescription = 'this is the transcript';

                const additionalMaterialItem: AdditionalMaterialItem = {
                    pdf: {
                        url: testPdf,
                        description: testPdfDescription,
                        name: testPdfName,
                    },
                };

                const myConfigurableContent = {
                    ...dummyConfigurableContent,

                    additionalMaterials: [additionalMaterialItem],
                };

                renderWithProviders(<AdditionalMaterials />, {
                    contentConfig: myConfigurableContent,
                });

                const searchResultForPdfName = screen.getByText(testPdfName);

                expect(searchResultForPdfName).toBeTruthy();

                const searchResultForPdfDescription = screen.getByText(testPdfDescription);

                expect(searchResultForPdfDescription).toBeTruthy();

                // TODO check that there is a link to the pdf
            });
        });

        describe(`when the media type is valid (only audio is supported)`, () => {
            it(`should display the materials`, () => {
                const dummyConfigurableContent = getDummyConfigurableContent();

                const testPdf = 'foo.pdf';

                const testPdfName = 'transcript';

                const testPdfDescription = 'this is the transcript';

                const testAudioItem = 'bar.mp3';

                const testAudioItemName = 'Bar the musical';

                const testAudioDescription =
                    'This is an awesome resource we will add to the language hub soon!';

                const testMimeType = MIMEType.mp3;

                const additionalMaterialItem: AdditionalMaterialItem = {
                    pdf: {
                        url: testPdf,
                        description: testPdfDescription,
                        name: testPdfName,
                    },
                    media: {
                        url: testAudioItem,
                        name: testAudioItemName,
                        description: testAudioDescription,
                        mimeType: testMimeType,
                    },
                };

                const myConfigurableContent = {
                    ...dummyConfigurableContent,

                    additionalMaterials: [additionalMaterialItem],
                };

                renderWithProviders(<AdditionalMaterials />, {
                    contentConfig: myConfigurableContent,
                });

                const searchResultForPdfName = screen.getByText(testPdfName);

                expect(searchResultForPdfName).toBeTruthy();

                const searchResultForPdfDescription = screen.getByText(testPdfDescription);

                expect(searchResultForPdfDescription).toBeTruthy();

                // TODO check that there is a link to the pdf

                const searchResultForAudioName = screen.getByText(testAudioItemName);

                expect(searchResultForAudioName).toBeTruthy();

                const searchResultForAudioDescription = screen.getByText(testAudioDescription);

                expect(searchResultForAudioDescription).toBeTruthy();

                // TODO check that there is a media item with the given src
            });
        });

        describe(`when the pdf is omitted`, () => {
            it(`should display the materials`, () => {
                const dummyConfigurableContent = getDummyConfigurableContent();

                const testAudioItem = 'bar.mp3';

                const testAudioItemName = 'Bar the musical';

                const testAudioDescription =
                    'This is an awesome resource we will add to the language hub soon!';

                const testMimeType = MIMEType.mp3;

                const additionalMaterialItem: AdditionalMaterialItem = {
                    media: {
                        url: testAudioItem,
                        name: testAudioItemName,
                        description: testAudioDescription,
                        mimeType: testMimeType,
                    },
                };

                const myConfigurableContent = {
                    ...dummyConfigurableContent,

                    additionalMaterials: [additionalMaterialItem],
                };

                renderWithProviders(<AdditionalMaterials />, {
                    contentConfig: myConfigurableContent,
                });

                const searchResultForAudioName = screen.getByText(testAudioItemName);

                expect(searchResultForAudioName).toBeTruthy();

                const searchResultForAudioDescription = screen.getByText(testAudioDescription);

                expect(searchResultForAudioDescription).toBeTruthy();

                // TODO check that there is a media item with the given src
            });
        });

        describe(`when the pdf and media are omitted`, () => {
            it(`should display the materials`, async () => {
                const dummyConfigurableContent = getDummyConfigurableContent();

                const additionalMaterialItem: AdditionalMaterialItem = {};

                const myConfigurableContent = {
                    ...dummyConfigurableContent,

                    additionalMaterials: [additionalMaterialItem],
                };

                renderWithProviders(<AdditionalMaterials />, {
                    contentConfig: myConfigurableContent,
                });

                await assertNotFound();
            });
        });

        describe(`when the media type is invalid (video is not supported)`, () => {
            it(`should display the materials`, () => {
                const dummyConfigurableContent = getDummyConfigurableContent();

                const testPdf = 'foo.pdf';

                const testPdfName = 'transcript';

                const testPdfDescription = 'this is the transcript';

                const testAudioItem = 'bar.mp3';

                const testAudioItemName = 'Bar the musical';

                const testAudioDescription =
                    'This is an awesome resource we will add to the language hub soon!';

                const additionalMaterialItem: AdditionalMaterialItem = {
                    pdf: {
                        url: testPdf,
                        description: testPdfDescription,
                        name: testPdfName,
                    },
                    media: {
                        url: testAudioItem,
                        name: testAudioItemName,
                        description: testAudioDescription,
                        mimeType: MIMEType.mov,
                    },
                };

                const myConfigurableContent = {
                    ...dummyConfigurableContent,

                    additionalMaterials: [additionalMaterialItem],
                };

                renderWithProviders(<AdditionalMaterials />, {
                    contentConfig: myConfigurableContent,
                });

                const searchResultForPdfName = screen.getByTestId('error');

                expect(searchResultForPdfName).toBeTruthy();
            });
        });
    });

    describe(`when additional materials are not provided in the content config`, () => {
        it(`should render not found`, () => {
            const dummyConfigurableContent = getDummyConfigurableContent();

            const myConfigurableContent = {
                ...dummyConfigurableContent,

                additionalMaterials: [],
            };

            renderWithProviders(<AdditionalMaterials />, {
                contentConfig: myConfigurableContent,
            });

            const searchPattern = new RegExp('No result found');

            const screenRes = screen.getByText(searchPattern);

            expect(screenRes).toBeTruthy();
        });
    });
});
