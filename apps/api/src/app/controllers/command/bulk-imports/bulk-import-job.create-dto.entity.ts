import { CommandFSA } from '../command-fsa/command-fsa.entity';

// TODO update filename?

export class CoscradBulkImportJobCreateDto {
    // This is generated automatically
    // readonly id: AggregateId;
    readonly name: string;

    sourceProject?: string;

    // this is auto-generated
    // readonly dateCreated: string;

    stream: CommandFSA[];
}
