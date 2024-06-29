import { IDigitalTextPage, LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Typography, styled } from '@mui/material';
import { isInLanguage } from '../../../utils/generic-components/presenters/is-in-language';
import { DigitalTextPageDetailTextPresenter } from './digital-text-page-detail-text-presenter';
import { PageContentForm, TextAndLanguage } from './page-content-form';

const StyledMuiPage = styled('div')({
    width: '80%',
    height: '48vh',
    margin: '2px',
    padding: '7px',
    position: 'relative',
    float: 'left',
    boxShadow: '0px 0px 10px 0px #666',
});

interface FullPagePresenterProps {
    page: IDigitalTextPage;
    onSubmitNewContent: (state: TextAndLanguage) => void;
    isAdmin?: boolean;
}

export const DigitalTextPageDetailPresenter = ({
    page,
    onSubmitNewContent,
    isAdmin: _isAdmin = false,
}: FullPagePresenterProps): JSX.Element => {
    const { identifier, content } = page;

    const hasContent = !isNullOrUndefined(content);

    const shouldShowAddContentForm = !hasContent && onSubmitNewContent; // && isAdmin

    // HACK: create long text variant of multilingual text?
    // or is this a totally custom implementation with form for
    // digitalTexts?
    const textItemInEnglish = hasContent
        ? content.items.find((item) => isInLanguage(LanguageCode.English, item))
        : null;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/186539815] Use a more standard \ idiomatic approach to forms.
     */
    return (
        <StyledMuiPage data-testid={`digital-text.page:${identifier}`}>
            {hasContent ? (
                <DigitalTextPageDetailTextPresenter textItem={textItemInEnglish} />
            ) : null}
            <Typography
                sx={{
                    bottom: 0,
                    right: 0,
                    mb: 1,
                    mr: 2,
                    position: 'absolute',
                    fontFamily: 'Times',
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    color: 'primary.main',
                }}
            >
                Page: {identifier}
            </Typography>
            {shouldShowAddContentForm ? (
                <PageContentForm onSubmitNewContent={onSubmitNewContent} />
            ) : !hasContent ? (
                <DigitalTextPageDetailTextPresenter textItem={'Content not yet added to page...'} />
            ) : null}
        </StyledMuiPage>
    );
};
