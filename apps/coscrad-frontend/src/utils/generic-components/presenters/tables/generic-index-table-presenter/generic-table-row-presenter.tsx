import { IBaseViewModel } from '@coscrad/api-interfaces';
import { stringify } from 'querystring';
import { Link } from 'react-router-dom';

// @deprecated Use GenericIndexTablePresenter instead
export const GenericTableRowPresenter = <T extends IBaseViewModel>(
    tableDataRow: T
): JSX.Element => (
    <tr data-testid={tableDataRow.id} key={tableDataRow.id}>
        <td>
            <Link to={tableDataRow.id}>View</Link>
        </td>
        {Object.entries(tableDataRow).map(([key, value]) => {
            return <td key={key}>{stringify(value)}</td>;
        })}
    </tr>
);
