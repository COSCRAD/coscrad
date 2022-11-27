import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

export const JournalArticleBibliographicReferenceThumbnailPresenter = ({
    data: { title, abstract, issueDate, publicationTitle },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    return (
        <Card>
            <CardHeader title="Journal Article Bibliographic Reference"></CardHeader>
            <CardContent>
                <div>
                    {title}
                    <br />
                    {publicationTitle} ({issueDate})
                    <Divider />
                    <br />
                    {
                        <div>
                            <h3>Abstract</h3>
                            {abstract}
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
    );
};
