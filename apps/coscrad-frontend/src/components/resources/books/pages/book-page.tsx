import { IBookPage } from '@coscrad/api-interfaces';
import { Card, CardContent, Divider } from '@mui/material';

export const BookPage = ({ text, translation, identifier }: IBookPage): JSX.Element => (
    <Card>
        <CardContent>
            <div data-testid={identifier}>
                <div>
                    <h2>Text</h2>
                    {text}
                    <br />
                </div>
                {translation && (
                    <div>
                        <h2>translation</h2>
                        {translation}
                    </div>
                )}
                <br />
                <Divider />
                <div>Page | {identifier}</div>
            </div>
        </CardContent>
    </Card>
);
