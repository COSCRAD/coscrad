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

interface PagePresenterProps {
    page: IDigitalTextPage;
    isSelected: boolean;
    onSubmitNewContent: (state: TextAndLanguage) => void;
    isAdmin?: boolean;
}

export const PagePresenter = ({
    page,
    isSelected,
    onSubmitNewContent,
    isAdmin = false,
}: PagePresenterProps): JSX.Element => {
    const { identifier, content } = page;

    const hasContent = !isNullOrUndefined(content);

    // TODO Is this working?
    const shouldShowAddContentForm = !hasContent && isAdmin;

    return (
        <StyledMuiPage>
            {hasContent ? <MultilingualTextPresenter text={content} /> : null}
            <Typography sx={{ bottom: 0, right: 0, mb: 1, mr: 1, position: 'absolute' }}>
                {isSelected ? '**' : ''}
                {identifier}
            </Typography>
            {shouldShowAddContentForm ? null : (
                <PageContentForm onSubmitNewContent={onSubmitNewContent} />
            )}
        </StyledMuiPage>
    );
};
