import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { Box, Typography, styled } from '@mui/material';
import { DigitalTextPageDetailPresenter } from './digital-text-page-detail-presenter';
import { NewPageForm } from './new-page-form';
import { TextAndLanguage } from './page-content-form';
import { PageIcon } from './page-icon';

const StyledPageIconViewer = styled(Box)({
    width: '100%',
    height: '70px',
    marginBottom: '25px',
    position: 'relative',
    display: 'inline-block',
    overflow: 'auto',
});

interface PagesPresenterProps {
    id: string;
    pages: IDigitalTextPage[];
    currentPageIdentifier?: string;
    setCurrentIndex: (pageIndex: number) => void;
    onSubmitPageIdentifier: (pageIdentifier: string) => void;
    onSubmitNewContent: (state: TextAndLanguage & { pageIdentifier: string }) => void;
}

export const PagesPresenter = ({
    pages,
    currentPageIdentifier,
    setCurrentIndex,
    onSubmitPageIdentifier,
    onSubmitNewContent,
}: PagesPresenterProps): JSX.Element => {
    const currentPage =
        pages.length > 0 ? pages.find((page) => page.identifier === currentPageIdentifier) : null;

    const allExistingPageIdentifiers = pages.map(({ identifier }) => identifier);

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
            <StyledPageIconViewer>
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
            </StyledPageIconViewer>
            <NewPageForm
                existingPageIdentifiers={allExistingPageIdentifiers}
                onSubmitPageIdentifier={(pageIdentifier) => onSubmitPageIdentifier(pageIdentifier)}
            />
            {pages.length > 0 ? (
                <Box
                    sx={{
                        width: '100%',
                        height: '50vh',
                    }}
                >
                    <DigitalTextPageDetailPresenter
                        page={currentPage}
                        // Note that we inject the page identifier here
                        onSubmitNewContent={({ text, languageCode }) =>
                            onSubmitNewContent({
                                text,
                                languageCode,
                                pageIdentifier: currentPage.identifier,
                            })
                        }
                    />
                </Box>
            ) : (
                <Typography variant="h6">
                    Use the Add Page form to add a new page to this digital text.
                </Typography>
            )}
        </>
    );
};
