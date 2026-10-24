import Box from '@mui/material/Box';
import { keyframes, styled } from '@mui/material/styles';

// 1. Define the blink animation
const blink = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

// 2. Create the styled Dot component
const BlinkingDot = styled(Box)(({ theme }) => ({
    width: '30vw',
    maxWidth: '40px',
    marginTop: '-7px',
    aspectRatio: 1 / 1,
    borderRadius: '50%',
    backgroundColor: '#dd0457ff', // Success green (or use theme.palette.success.main)
    // display: 'inline-block',
    animation: `${blink} 1.5s infinite ease-in-out`,
}));

// 3. Use it anywhere
export const BlinkingStatusDot = () => {
    return <BlinkingDot />;
};
