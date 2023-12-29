import { AggregateType, IValueAndDisplay } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { SinglePropertyPresenter } from '../../../../utils/generic-components';
import { buildDataAttributeForAggregateDetailComponent } from '../../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

interface BibliographicCitationCardProps {
    id: string;
    header: string;
    title: string;
    labelsAndValues: IValueAndDisplay<unknown>[];
}

/**
 * Note that any values of `null` or `undefind` within `labelsAndValues` will be
 * filtered out for you.
 */
export const BibliographicCitationCard = ({
    id,
    header,
    title,
    labelsAndValues,
}: BibliographicCitationCardProps) => (
    <Card>
        <CardHeader title={header}></CardHeader>
        <CardContent>
            <div
                data-testid={buildDataAttributeForAggregateDetailComponent(
                    AggregateType.bibliographicCitation,
                    id
                )}
            >
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
