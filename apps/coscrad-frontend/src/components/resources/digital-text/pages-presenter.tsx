import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { Box, Typography, styled } from '@mui/material';
import { useState } from 'react';
import { DigitalTextPageDetailPresenter } from './digital-text-page-detail-presenter';
import { TextAndLanguage } from './page-content-form';
import { PageIcon } from './page-icon';

const StyledPages = styled(Box)({
    width: '100%',
    height: '70px',
    padding: '3px',
    position: 'relative',
    display: 'inline-block',
    border: '1px solid #666',
    overflow: 'auto',
});

enum PagesViewType {
    singleSelected = 'singleSelected',
    icons = 'icons',
}

interface PagesPresenterProps {
    pages: IDigitalTextPage[];
    currentPageIdentifier?: string;
    setCurrentIndex: (pageIndex: number) => void;
    onSubmitNewContent: (state: TextAndLanguage & { pageIdentifier: string }) => void;
}

export const PagesPresenter = ({
    pages,
    currentPageIdentifier,
    setCurrentIndex,
    onSubmitNewContent,
}: PagesPresenterProps): JSX.Element => {
    const [viewType, setViewType] = useState<PagesViewType>(PagesViewType.icons);

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
            <StyledPages>
                {viewType === PagesViewType.singleSelected ? (
                    <DigitalTextPageDetailPresenter
                        page={currentPage}
                        isSelected={currentPageIdentifier === currentPage.identifier}
                        // Note that we inject the page identifier here
                        onSubmitNewContent={({ text, languageCode }) =>
                            onSubmitNewContent({
                                text,
                                languageCode,
                                pageIdentifier: currentPage.identifier,
                            })
                        }
                    />
                ) : (
                    pages.map((page, index) => (
                        <PageIcon
                            key={page.identifier}
                            page={page}
                            pageIndex={index}
                            setCurrentIndex={setCurrentIndex}
                            isSelected={page.identifier === currentPageIdentifier}
                        />
                    ))
                )}
            </StyledPages>
            {/* <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            onChange={(_e) =>
                                setViewType(
                                    viewType === PagesViewType.singleSelected
                                        ? PagesViewType.icons
                                        : PagesViewType.singleSelected
                                )
                            }
                        />
                    }
                    label={viewType === PagesViewType.icons ? 'icons' : 'page details'}
                />
            </FormGroup> */}
            <Box sx={{ width: '100%', height: '50vh', border: '1px solid black' }}>
                <DigitalTextPageDetailPresenter
                    page={currentPage}
                    isSelected={currentPageIdentifier === currentPage.identifier}
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
        </>
    );
};
