import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { Box, FormControlLabel, FormGroup, Switch, Typography, styled } from '@mui/material';
import { useState } from 'react';
import { DigitalTextPageDetailPresenter } from './digital-text-page-detail-presenter';
import { TextAndLanguage } from './page-content-form';
import { PageIcon } from './page-icon';

const StyledPages = styled(Box)({
    width: '100%',
    height: '210px',
    padding: '3px',
    position: 'relative',
    display: 'block',
    border: '1px solid #666',
});

interface PagePresenterProps {
    pages: IDigitalTextPage[];
    currentPageIdentifier?: string;
    onSubmitNewContent: (state: TextAndLanguage & { pageIdentifier: string }) => void;
}

enum PagesViewType {
    singleSelected = 'singleSelected',
    icons = 'icons',
}

export const PagesPresenter = ({
    pages,
    currentPageIdentifier,
    onSubmitNewContent,
}: PagePresenterProps): JSX.Element => {
    const [viewType, setViewType] = useState<PagesViewType>(PagesViewType.singleSelected);

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
                    pages.map((page) => (
                        <PageIcon
                            page={page}
                            isSelected={page.identifier === currentPageIdentifier}
                        />
                    ))
                )}
            </StyledPages>
            <FormGroup>
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
            </FormGroup>
        </>
    );
};
