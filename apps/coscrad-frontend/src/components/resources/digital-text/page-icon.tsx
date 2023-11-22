import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Typography, styled } from '@mui/material';

const StyledMuiPage = styled('div')({
    width: '140px',
    height: '200px',
    margin: '2px',
    position: 'relative',
    float: 'left',
    border: '2px solid #05803b',
});

interface PageIconProps {
    page: IDigitalTextPage;
    isSelected: boolean;
}

export const PageIcon = ({ page, isSelected }: PageIconProps): JSX.Element => {
    const { identifier, content } = page;

    const hasContent = !isNullOrUndefined(content);

    return (
        <StyledMuiPage data-testid={`digital-text.page:${identifier}`}>
            {hasContent ? <Typography variant="body2">...</Typography> : null}
            <Typography sx={{ bottom: 0, right: 0, mb: 1, mr: 1, position: 'absolute' }}>
                {isSelected ? '**' : ''}
                {identifier}
            </Typography>
        </StyledMuiPage>
    );
};
