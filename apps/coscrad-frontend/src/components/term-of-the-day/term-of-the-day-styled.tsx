import { styled } from '@mui/material';

export const TermOfTheDayContainerStyled = styled('div')({
    textAlign: 'center',
    display: 'inline-flex',
    flexDirection: 'column',
    width: '100%',
    padding: '20px 0 20px 0',
});

export const TermOfTheDayHeader = styled('div')({
    fontWeight: 'bold',
    padding: '0 0 20px 0',
    display: 'block',
    fontSize: '2.5em',
});

export const TermOfTheDayCurrentDate = styled('div')({
    padding: '20px 0 0 0',
    fontSize: '24px',
});
