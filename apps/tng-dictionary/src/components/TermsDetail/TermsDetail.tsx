import './TermsDetail.module.css';
import * as React from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Tŝilhqotin', width: 150 },
  { field: 'col2', headerName: 'English', width: 150 },
];

const rows: GridRowsProp = [
  { id: 1, col1: 'Tŝilhqotin', col2: 'Chilcotin' },
  { id: 2, col1: 'yeŝ', col2: 'Snow' },
  { id: 3, col1: 'mus', col2: 'Moose' },
  { id: 4, col1: 'tabanx', col2: 'shore' },
  { id: 5, col1: 'ses', col2: 'bear' }
];

/* eslint-disable-next-line */
export interface TermsDetailComponentProps { }

export function TermsDetailComponent(props: TermsDetailComponentProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ height: '90vh', width: '100%' }}>
        <DataGrid rows={rows} columns={columns} pageSize={10} />
      </div>
    </div>

  );
}

export default TermsDetailComponent;
