import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

export const CourtCaseBibliographicReferenceDetailThumbnailPresenter = ({
    data: { caseName, abstract, dateDecided, pages },
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    return (
        <Card>
            <CardHeader title="Court Case Bibliographic Reference"></CardHeader>
            <CardContent>
                <div>
                    {caseName}
                    <br />
                    {pages && <div>{pages} pages</div>}
                    {dateDecided && <div>({dateDecided})</div>}
                    <Divider />
                    <div>
                        <h3>Abstract</h3>
                        {abstract}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
