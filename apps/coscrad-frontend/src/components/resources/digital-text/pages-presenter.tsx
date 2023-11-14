import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { Box, Typography, styled } from '@mui/material';
import { PagePresenter } from './page-presenter';

const PagesContainer = styled(Box)({
    width: '100%',
    height: '210px',
    padding: '3px',
    position: 'relative',
    display: 'block',
    border: '1px solid #666',
});

interface PagePresenterProps {
    pages: IDigitalTextPage[];
}

export const PagesPresenter = ({ pages }: PagePresenterProps): JSX.Element => {
    /**
     *TODO: sort page identifiers including roman numerals and other formats: 
     'I -1', 'A - 1', etc.
     */
    return (
        <>
            <Typography variant="h6" sx={{ mt: 2 }}>
                Pages:
            </Typography>
            <PagesContainer>
                {pages.map((page) => (
                    <PagePresenter page={page} />
                ))}
            </PagesContainer>
        </>
    );
};
