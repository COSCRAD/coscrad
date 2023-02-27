import { Typography } from '@mui/material';

interface CopyrightProps {
    copyrightHolder: string;
}

export const Copyright = ({ copyrightHolder }: CopyrightProps) => (
    <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} {copyrightHolder}
    </Typography>
);
