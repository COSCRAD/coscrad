import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { Box, Typography, styled } from '@mui/material';
import { DigitalTextPageDetailPresenter } from './digital-text-page-detail-presenter';
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
}

export const PagesPresenter = ({
    pages,
    currentPageIdentifier,
    setCurrentIndex,
}: PagesPresenterProps): JSX.Element => {
    const currentPage = pages.find((page) => page.identifier === currentPageIdentifier);

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
                {pages.map((page, index) => (
                    <PageIcon
                        key={page.identifier}
                        page={page}
                        pageIndex={index}
                        setCurrentIndex={setCurrentIndex}
                        isSelected={page.identifier === currentPageIdentifier}
                    />
                ))}
            </StyledPageIconViewer>
            <Box
                sx={{
                    width: '100%',
                    height: '50vh',
                }}
            >
                <DigitalTextPageDetailPresenter page={currentPage} />
            </Box>
        </>
    );
};
