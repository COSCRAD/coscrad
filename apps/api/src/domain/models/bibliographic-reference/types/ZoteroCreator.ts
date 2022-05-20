type ZoteroHumanCreator = {
    firstName: string; // non-zero length

    lastName: string; // non-zero length

    type: CreatorType; // isEnum(CreatorType)
};

type ZoteroInstitutionCreator = {
    name: string; //non-zero length

    type: CreatorType; // isEnum(CreatorType);
};

export type ZoteroCreator = ZoteroHumanCreator | ZoteroInstitutionCreator;

export enum CreatorType {
    author = 'Author',
    artist = 'Artist',
    director = 'Director',
}
