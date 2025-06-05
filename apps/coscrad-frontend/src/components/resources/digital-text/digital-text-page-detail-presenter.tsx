import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Typography, styled } from '@mui/material';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { PageContentForm, TextAndLanguage } from './page-content-form';

const StyledMuiPage = styled('div')({
    width: '140px',
    height: '200px',
    margin: '2px',
    position: 'relative',
    float: 'left',
    border: '2px solid #05803b',
});

interface FullPagePresenterProps {
    page: IDigitalTextPage;
    isSelected: boolean;
    onSubmitNewContent: (state: TextAndLanguage) => void;
    isAdmin?: boolean;
}

export const DigitalTextPageDetailPresenter = ({
    page,
    isSelected,
    onSubmitNewContent,
    isAdmin: _isAdmin = false,
}: FullPagePresenterProps): JSX.Element => {
    const { identifier, content } = page;

    const hasContent = !isNullOrUndefined(content);

    const shouldShowAddContentForm = !hasContent; // && isAdmin

    /**
     * TODO [https://www.pivotaltracker.com/story/show/186539815] Use a more standard \ idiomatic approach to forms.
     */
    return (
        <StyledMuiPage data-testid={`digital-text.page:${identifier}`}>
            {hasContent ? <MultilingualTextPresenter text={content} /> : null}
            <Typography sx={{ bottom: 0, right: 0, mb: 1, mr: 1, position: 'absolute' }}>
                {isSelected ? '**' : ''}
                {identifier}
            </Typography>
            {shouldShowAddContentForm ? (
                <PageContentForm onSubmitNewContent={onSubmitNewContent} />
            ) : null}
        </StyledMuiPage>
    );
};
