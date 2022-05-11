import { EdgeConnection } from '../../../../domain/models/context/edge-connection.entity';
import { NoteViewModel } from '../../../edgeConnectionViewModels/note.view-model';
import { TagViewModel } from '../tag.view-model';

export type NoteTreeViewModel = {
    label: string;

    nodes: NoteTree[];
};

type NoteTree = {
    tag: TagViewModel;

    notes: NoteViewModel[];

    children: NoteTree[];
};

const foo: NoteTreeViewModel = {
    label: 'notes',
    nodes: [
        {
            tag: {
                label: 'mammals',
                id: '1',
            },
            notes: [new NoteViewModel({} as EdgeConnection)],
            children: [
                {
                    tag: {
                        label: 'cats',
                        id: '3',
                    },
                    notes: [new NoteViewModel({} as EdgeConnection)],
                    children: [
                        {
                            tag: {
                                label: 'big cats',
                                id: '35',
                            },
                            notes: [
                                new NoteViewModel({} as EdgeConnection),
                                new NoteViewModel({} as EdgeConnection),
                            ],
                            children: [],
                        },
                        {
                            tag: {
                                label: 'domesticated cats',
                                id: '1',
                            },
                            notes: [
                                new NoteViewModel({} as EdgeConnection),
                                new NoteViewModel({} as EdgeConnection),
                                new NoteViewModel({} as EdgeConnection),
                            ],
                            children: [],
                        },
                    ],
                },
                {
                    tag: {
                        label: 'dogs',
                        id: '7',
                    },
                    notes: [
                        new NoteViewModel({} as EdgeConnection),
                        new NoteViewModel({} as EdgeConnection),
                        new NoteViewModel({} as EdgeConnection),
                        new NoteViewModel({} as EdgeConnection),
                        new NoteViewModel({} as EdgeConnection),
                    ],
                    children: [],
                },
                {
                    tag: {
                        label: 'rodents',
                        id: '12',
                    },
                    notes: [
                        new NoteViewModel({} as EdgeConnection),
                        new NoteViewModel({} as EdgeConnection),
                    ],
                    children: [],
                },
            ],
        },
    ],
};

foo;
