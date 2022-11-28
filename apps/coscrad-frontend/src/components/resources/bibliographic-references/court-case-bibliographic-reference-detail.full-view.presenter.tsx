import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    IValueAndDisplay,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { SinglePropertyPresenter } from '../../../utils/generic-components';

export const CourtCaseBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data: { caseName, abstract, dateDecided, court, url, pages },
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    const labelsAndValues: IValueAndDisplay<unknown>[] = (
        [
            [abstract, 'Abstract'],
            [dateDecided, 'Date Decided'],
            [court, 'Court'],
            // TODO format as external link
            [url, 'External Link'],
            [pages, 'Pages'],
        ] as const
    )
        // Do not present optional values
        .filter(([value, _]) => value !== null && typeof value !== 'undefined')
        .map(([value, display]) => ({
            value,
            display,
        }));

    return (
        <Card>
            <CardHeader title="Court Case Bibliographic Reference"></CardHeader>
            <CardContent>
                <div data-testid={id}>
                    {caseName}
                    <Divider />
                    <br />
                    {labelsAndValues.map((valueAndDisplay) => (
                        <SinglePropertyPresenter {...valueAndDisplay} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
