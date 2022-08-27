import { CourtCaseBibliographicReference } from '../../domain/models/bibliographic-reference/court-case-bibliographic-reference/court-case-bibliographic-reference.entity';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<CourtCaseBibliographicReference>[] = [
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.courtCase,
            caseName: "2002-07-08_Tsilhqot'inTitleCase",
            creators: [],
            abstract:
                "William, June\n- Nemiah Valley\n- Qualifying as an expert in Tsilhqot'in written language",
            dateDecided: 'Recorded 2002-07-08',
            court: 'Supreme Court of British Columbia',
            url: 'https://www.myzoterolink.com/bogus-link-to-doc.php',
            pages: 'Pages 1-6',
        },
        published: true,
        id: '44',
    },
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.courtCase,
            caseName: '2003-07-29_ElizaWilliam_affidavit',
            creators: [],
            abstract: 'William, Eliza\n- Affidavit #2',
            dateDecided: 'Sworn 2003-07-29',
            court: 'Supreme Court of British Columbia',
            url: 'https://mysecurelink.com/another-bogus-link.cfm',
            pages: 'Pages 1 - 73',
        },
        published: true,
        id: '45',
    },
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.courtCase,
            caseName: 'IN THE SUPREME COURT OF BRITISH COLUMBIA',
            creators: [],
            abstract:
                'Roger William, on his own behalf, on behalf of all other members of the Xeni Gwet’in First Nations Government and on behalf of all other members of the Tsilhqot’in Nation\n\nAppellant\n\nV.\n\nHer Majesty The Queen in Right of the Province of British Columbia, Regional Manager of the Cariboo Forest Region and Attorney General of Canada Respondents\n\nAnd\n\nAttorney General of Quebec, Attorney General of Manitoba, Attorney General for Saskatchewan, Attorney General of Alberta, Te’mexw Treaty Association, Business Council of British Columbia, Council of Forest Industries, Coast Forest Products Association, Mining Association of British Columbia, Association for Mineral Exploration British Columbia, Assembly of First Nations, Gitanyow Hereditary Chiefs of Gwass Hlaam, Gamlaxyeltxw, Malii, Gwinuu, Haizimsque, Watakhayetsxw, Luuxhon and Wii’litswx, on their own behalf and on behalf of all Gitanyow, Hul’qumi’num Treaty Group, Council of the Haida Nation, Office of the Wet’suwet’en Chiefs, Indigenous Bar Association in Canada, First Nations Summit, Tsawout First Nation, Tsartlip First Nation, Snuneymuxw First Nation, Kwakiutl First Nation, Coalition of Union of British Columbia Indian Chiefs, Okanagan Nation Alliance, Shuswap Nation Tribal Council and their member communities, Okanagan, Adams Lake, Neskonlith and Splatsin Indian Bands, Amnesty International, Canadian Friends Service Committee, Gitxaala Nation, Chilko Resorts and Community Association and Council of Canadians\n\nInterveners\n\nIndexed as:  Tsilhqot’in Nation v. British Columbia\n2014 SCC 44\nFile No.:  34986.\n2013:  November 7; 2014:  June 26.\nPresent:  McLachlin C.J. and LeBel, Abella, Rothstein, Cromwell, Moldaver, Karakatsanis and Wagner JJ.',
            dateDecided: '2007-11-20',
            court: 'Supreme Court of British Columbia',
            url: 'https://www.bccourts.ca/Jdb-txt/SC/07/17/2007BCSC1700.pdf',
        },
        published: true,
        id: '46',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new CourtCaseBibliographicReference(dto));
