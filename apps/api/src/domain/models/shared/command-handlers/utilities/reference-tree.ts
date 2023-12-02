import { CompositeIdentifier } from '@coscrad/api-interfaces';

export class ReferenceTree {
    private references = new Map<string, string[]>();

    has(type: string, id: string): boolean;
    has(type: string, ids: string[]): boolean;
    has(type: string, input: string | string[]): boolean {
        // In case only one ID is requested, we package this in an array for symmetry
        const idsToFind = Array.isArray(input) ? input : [input];

        const result =
            this.references.has(type) &&
            idsToFind.every((idToFind) => this.references.get(type).includes(idToFind));

        return result;
    }

    append(type: string, id: string): ReferenceTree;
    append(type: string, ids: string[]): ReferenceTree;
    append(type: string, input: string | string[]): ReferenceTree {
        // In case only one ID is requested, we package this in an array for code reuse below
        const idsToAppend = Array.isArray(input) ? input : [input];

        const existingIds = this.references.has(type) ? this.references.get(type) : [];

        const updatedIds = idsToAppend.reduce(
            // We avoid duplicating IDs here- using a set would work as well- consider this
            (acc, nextNewId) => (acc.includes(nextNewId) ? acc : acc.concat([nextNewId])),
            existingIds
        );

        // note that maps are immutable so we must update the reference
        this.references = this.references.set(type, updatedIds);

        return this;
    }

    compare(that: ReferenceTree): CompositeIdentifier<string>[] {
        return [...that.references.entries()].flatMap(([key, ids]) =>
            ids.flatMap((id) =>
                this.has(key, id)
                    ? []
                    : [
                          {
                              type: key,
                              id,
                          },
                      ]
            )
        );
    }

    static fromCompositeIdentifierList(compositeIdentifiers: CompositeIdentifier<string>[]) {
        return compositeIdentifiers.reduce(
            (acc: ReferenceTree, { type, id }) => acc.append(type, id),
            new ReferenceTree()
        );
    }
}
