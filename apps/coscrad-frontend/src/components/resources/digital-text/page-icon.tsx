import { IDigitalTextPage } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Notes as NotesIcon } from '@mui/icons-material/';
import { Typography, styled } from '@mui/material';

const StyledMuiPage = styled('div')({
    width: '40px',
    height: '60px',
    margin: '4px',
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
            sx={{ boxShadow: isSelected ? '0px 0px 12px 0px #6ab9ae' : '0px' }}
        >
            {hasContent ? <NotesIcon /> : null}
            <Typography sx={{ bottom: 0, right: 0, mr: 0.5, position: 'absolute' }}>
                {identifier}
            </Typography>
        </StyledMuiPage>
    );
};
