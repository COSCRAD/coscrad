import { IDigitalTextPage, ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Typography } from '@mui/material';
import { DigitalTextPageDetailPresenter } from './digital-text-page-detail-presenter';
import { NewPageForm } from './new-page-form';
import { TextAndLanguage } from './page-content-form';
import { PageIcon } from './page-icon';
import { PageNotesPresenter } from './page-notes-presenter';

const PAGE_ICON_WIDTH = 40;

const PAGE_ICON_MARGIN = 5;

const PAGE_ICON_BORDER_WIDTH = 2;

interface PagesPresenterProps {
    compositeIdentifier: ResourceCompositeIdentifier;
    pages: IDigitalTextPage[];
    currentPageIdentifier?: string;
    setCurrentIndex: (pageIndex: number) => void;
    onSubmitPageIdentifier?: (pageIdentifier: string) => void;
    onSubmitNewContent?: (state: TextAndLanguage & { pageIdentifier: string }) => void;
}

export const PagesPresenter = ({
    compositeIdentifier,
    pages,
    currentPageIdentifier,
    setCurrentIndex,
    onSubmitPageIdentifier,
    onSubmitNewContent,
}: PagesPresenterProps): JSX.Element => {
    const currentPage =
        pages.length > 0 ? pages.find((page) => page.identifier === currentPageIdentifier) : null;

    const allExistingPageIdentifiers = pages.map(({ identifier }) => identifier);

    const pageIconViewerWidth =
        (PAGE_ICON_WIDTH + (PAGE_ICON_MARGIN + PAGE_ICON_BORDER_WIDTH) * 2) * pages.length;

    /**
     *TODO: sort page identifiers including roman numerals and other formats: 
     'I -1', 'A - 1', etc.
     */
    return (
        <>
            <Typography variant="h6" sx={{ mt: 2 }}>
                Pages:
            </Typography>
            {/* TODO: need to be able to filter for a page when there are 20 or more */}
            <Box
                sx={{
                    width: '100%',
                    height: '80px',
                    overflowX: 'scroll',
                    border: '1px solid #ddd',
                    mb: 1,
                }}
            >
                <Box sx={{ width: `${pageIconViewerWidth}px` }}>
                    {pages.length > 0
                        ? pages.map((page, index) => (
                              <PageIcon
                                  key={page.identifier}
                                  page={page}
                                  pageIndex={index}
                                  setCurrentIndex={setCurrentIndex}
                                  isSelected={page.identifier === currentPageIdentifier}
                              />
                          ))
                        : null}
                </Box>
            </Box>
            {!isNullOrUndefined(onSubmitPageIdentifier) ? (
                <NewPageForm
                    existingPageIdentifiers={allExistingPageIdentifiers}
                    onSubmitPageIdentifier={(pageIdentifier) =>
                        onSubmitPageIdentifier(pageIdentifier)
                    }
                />
            ) : null}
            {pages.length > 0 ? (
                <>
                    <Box
                        sx={{
                            width: '100%',
                            height: '50vh',
                            mb: 1,
                        }}
                    >
                        <DigitalTextPageDetailPresenter
                            page={currentPage}
                            // Note that we inject the page identifier here
                            onSubmitNewContent={
                                !isNullOrUndefined(onSubmitNewContent)
                                    ? ({ text, languageCode }) =>
                                          onSubmitNewContent({
                                              text,
                                              languageCode,
                                              pageIdentifier: currentPage.identifier,
                                          })
                                    : null
                            }
                        />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                        <PageNotesPresenter
                            compositeIdentifier={compositeIdentifier}
                            page={currentPage}
                        />
                    </Box>
                </>
            ) : (
                <Typography variant="h6">
                    Use the Add Page form to add a new page to this digital text.
                </Typography>
            )}
        </>
    );
};
