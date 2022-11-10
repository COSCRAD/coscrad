import { IBaseViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';

// We may want to extend `HasId` instead
export const GenericTableRowPresenter = <T extends IBaseViewModel>(
    tableDataRow: T
): JSX.Element => (
    <tr data-testid={tableDataRow.id}>
        <td>
            <Link to={tableDataRow.id}>View</Link>
        </td>
        {Object.entries(tableDataRow).map(([key, value]) => {
            return <td key={key}>{JSON.stringify(value).replace(/^"|"$/g, '')}</td>;
        })}
    </tr>
);
