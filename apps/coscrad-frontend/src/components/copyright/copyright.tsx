import { Typography } from '@mui/material';

interface CopyrightProps {
    copyrightHolder: string;
}

export const Copyright = ({ copyrightHolder }: CopyrightProps) => (
    <Typography color="text.secondary">
        &copy; {new Date().getFullYear()} {copyrightHolder}
    </Typography>
);
