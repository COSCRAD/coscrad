import { EdgeConnection } from 'apps/api/src/domain/models/context/edge-connection.entity';
import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { resourceTypes } from '../../../domain/types/resourceTypes';

export default (): EdgeConnection[] =>
    [
        {
            type: EdgeConnectionType.self,
            tagIDs: ['0'],
            note: 'This first 4 letters of this term form a syllable that indicates this is a plant ',
            members: [
                {
                    role: EdgeConnectionMemberRole.self,
                    compositeIdentifier: {
                        id: '1',
                        type: resourceTypes.term,
                    },
                    context: new TextFieldContext({
                        target: 'term',
                        charRange: [0, 3],
                    }).toDTO(),
                },
            ],
        },
        {
            type: EdgeConnectionType.self,
            tagIDs: ['1'],
            note: 'These pages are about bears',
            members: [
                {
                    role: EdgeConnectionMemberRole.self,
                    compositeIdentifier: {
                        id: '24',
                        type: resourceTypes.book,
                    },
                    context: new PageRangeContext({
                        pageIdentifiers: ['ix'],
                    }).toDTO(),
                },
            ],
        },
    ].map((dto) => new EdgeConnection(dto));
