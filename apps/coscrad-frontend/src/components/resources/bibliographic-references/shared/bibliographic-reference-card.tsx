import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { SinglePropertyPresenter } from '../../../../utils/generic-components';

interface BibliographicReferenceCardProps {
    id: string;
    header: string;
    title: string;
    labelsAndValues: IValueAndDisplay<unknown>[];
}

/**
 * Note that any values of `null` or `undefind` within `labelsAndValues` will be
 * filtered out for you.
 */
export const BibliographicReferenceCard = ({
    id,
    header,
    title,
    labelsAndValues,
}: BibliographicReferenceCardProps) => (
    <Card>
        <CardHeader title={header}></CardHeader>
        <CardContent>
            <div data-testid={id}>
                {title}
                <Divider />
                <br />
                {labelsAndValues
                    .filter(({ value }) => value !== null && typeof value !== 'undefined')
                    .map((valueAndDisplay) => (
                        <SinglePropertyPresenter
                            {...valueAndDisplay}
                            key={valueAndDisplay.display}
                        />
                    ))}
            </div>
        </CardContent>
    </Card>
);
