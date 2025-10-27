import { aql } from 'arangojs';

describe(`aql`, () => {
    it(`should work`, () => {
        // const testQuery = valueEquals(10, values, 'foobarbaz');

        // expect(testQuery).toEqual(5);

        const collectionName = 'books';

        const topLevelField = 'pages';

        const values = [5, 10];

        let varCount = 0;

        const field2 = 'barz';

        const another = aql`
        for doc in ${collectionName}
        let matches_${++varCount} = (
            for p in doc[${topLevelField}]
            filter length(p) > ${values[0]}
            return "m"
        )
        filter matches_${++varCount} > 0 && doc[${field2}] == ${values[1]}
        return doc
        `;

        expect(another).toBe(100);
    });
});
