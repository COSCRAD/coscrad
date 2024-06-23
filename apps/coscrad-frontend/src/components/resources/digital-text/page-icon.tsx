import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Typography, styled } from '@mui/material';

const StyledMuiPage = styled('div')({
    width: '40px',
    height: '60px',
    margin: '2px',
    position: 'relative',
    float: 'left',
    border: '2px solid #05803b',
});

interface PageIconProps {
    page: IDigitalTextPage;
    pageIndex: number;
    setCurrentIndex: (pageIndex: number) => void;
    isSelected: boolean;
}

export const PageIcon = ({
    page,
    pageIndex,
    isSelected,
    setCurrentIndex,
}: PageIconProps): JSX.Element => {
    const { identifier, content } = page;

    const hasContent = !isNullOrUndefined(content);

    return (
        <StyledMuiPage
            data-testid={`digital-text.page:${identifier}`}
            onClick={() => {
                setCurrentIndex(pageIndex);
            }}
            onDoubleClick={() => {
                console.log('double clicked!');
            }}
            // TODO: use primary.main for highlight color
            sx={{ boxShadow: isSelected ? '0px 0px 15px 0px #6ab9ae' : '0px' }}
        >
            {hasContent ? <Typography variant="body2">...</Typography> : null}
            <Typography sx={{ bottom: 0, right: 0, mr: 0.5, position: 'absolute' }}>
                {isSelected ? '**' : ''}
                {identifier}
            </Typography>
        </StyledMuiPage>
    );
};
