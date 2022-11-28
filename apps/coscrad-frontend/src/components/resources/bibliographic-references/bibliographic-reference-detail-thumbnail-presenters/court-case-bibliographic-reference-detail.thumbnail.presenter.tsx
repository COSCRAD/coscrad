import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { Abstract } from './abstract';

export const CourtCaseBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data: { caseName, abstract, dateDecided, pages },
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    return (
        <Card>
            <CardHeader title="Court Case Bibliographic Reference"></CardHeader>
            <CardContent>
                <div data-testid={id}>
                    {caseName}
                    <br />
                    {pages && <div>{pages} pages</div>}
                    {dateDecided && <div>({dateDecided})</div>}
                    <Divider />
                    {abstract !== null && typeof abstract !== undefined && (
                        <Abstract abstract={abstract} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
