import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Typography, styled } from '@mui/material';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';

const Page = styled('div')({
    width: '140px',
    height: '200px',
    margin: '2px',
    position: 'relative',
    float: 'left',
    border: '2px solid #05803b',
});

interface PagePresenterProps {
    page: IDigitalTextPage;
}

export const PagePresenter = ({ page }: PagePresenterProps): JSX.Element => {
    const { identifier, content } = page;

    return (
        <Page>
            {!isNullOrUndefined(content) ? <MultilingualTextPresenter text={content} /> : null}
            <Typography sx={{ bottom: 0, right: 0, mb: 1, mr: 1, position: 'absolute' }}>
                {identifier}
            </Typography>
        </Page>
    );
};
