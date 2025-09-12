import { CoscradDataExample } from '../../../../test-data/utilities';
import { CommandFSA } from '../command-fsa/command-fsa.entity';

// TODO update filename?

@CoscradDataExample<CoscradBulkImportJobCreateDto>({
    example: {
        name: 'my bulk import job',
        sourceProject: '2002 Legacy Collection',
        stream: [],
    },
})
export class CoscradBulkImportJobCreateDto {
    // This is generated automatically
    // readonly id: AggregateId;
    readonly name: string;

    sourceProject?: string;

    // this is auto-generated
    // readonly dateCreated: string;

    stream: CommandFSA[];
}
