import { Card, CardContent, CardHeader } from '@mui/material';

interface AbstractProps {
    abstract: string;
}

export const Abstract = ({ abstract }: AbstractProps): JSX.Element => (
    <Card>
        <CardHeader title={abstract} />
        <CardContent>{abstract}</CardContent>
    </Card>
);
