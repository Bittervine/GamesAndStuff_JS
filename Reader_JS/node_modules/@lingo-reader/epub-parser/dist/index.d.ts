import { InputFile, EBookParser } from '@lingo-reader/shared';

// xml:lang scheme

interface Contributor {
  contributor: string
  fileAs?: string
  role?: string

  // append in <meta>
  scheme?: string
  alternateScript?: string
}

interface Subject {
  subject: string
  authority?: string
  term?: string
}

interface Identifier {
  id: string
  identifierType?: string
  scheme?: string
}

interface Link {
  href: string
  hreflang?: string
  id?: string
  mediaType?: string
  properties?: string
  rel: string
}

interface EpubFileInfo {
  fileName: string
  mimetype: string
}

interface EpubMetadata {
  title: string
  language: string
  description?: string
  publisher?: string
  type?: string
  format?: string
  source?: string
  relation?: string
  coverage?: string
  rights?: string

  date?: Record<string, string>
  identifier: Identifier
  packageIdentifier: Identifier
  creator?: Contributor[]
  contributor?: Contributor[]
  subject?: Subject[]

  metas?: Record<string, string>
  links?: Link[]
}

/**
 * ManifestItem is parsed from the manifest tag in the opf file.
 *  content reference like:
 *  <item href="pgepub.css" id="item29" media-type="text/css"/>
 */
interface ManifestItem {
  id: string
  href: string
  mediaType: string
  properties?: string
  mediaOverlay?: string
  fallback?: string[]
}

// idref, linear, id, properties attributes when parsing spine>itemref
type SpineItem = ManifestItem & { linear?: string }
type EpubSpine = SpineItem[]

interface GuideReference {
  title: string
  type: string
  href: string
}
type EpubGuide = GuideReference[]

interface CollectionItem {
  role: string
  links: string[]
}
type EpubCollection = CollectionItem[]

// for .ncx file
interface NavPoint {
  label: string
  href: string
  id: string
  playOrder: string
  children?: NavPoint[]
}
type EpubToc = NavPoint[]

interface PageTarget {
  label: string
  value: string
  href: string
  playOrder: string
  type: string
  correspondId: string
}

interface PageList {
  label: string
  pageTargets: PageTarget[]
}

interface NavTarget {
  label: string
  href: string
  correspondId: string
}

interface NavList {
  label: string
  navTargets: NavTarget[]
}

interface EpubCssPart {
  id: string
  href: string
}

interface EpubProcessedChapter {
  css: EpubCssPart[]
  html: string
  mediaOverlays?: SmilAudios
}

interface EpubResolvedHref {
  id: string
  selector: string
}

/**
 * decryption
 */
type RsaHash = 'sha1' | 'sha256' | 'sha384' | 'sha512'

type AesName = 'aes-256-cbc' | 'aes-256-ctr' | 'aes-256-gcm'
  | 'aes-192-cbc' | 'aes-192-ctr' | 'aes-192-gcm'
  | 'aes-128-cbc' | 'aes-128-ctr' | 'aes-128-gcm'

type IdToKey = Record<string, Uint8Array>

type FileProcessor = (file: Uint8Array) => Promise<Uint8Array> | Uint8Array
type PathToProcessors = Record<string, FileProcessor[]>

interface EpubFileOptions {
  rsaPrivateKey?: string | Uint8Array
  aesSymmetricKey?: string | Uint8Array
}

interface EncryptionKeys {
  rsaPrivateKey?: Uint8Array
  aesSymmetricKey?: Uint8Array
}

/**
 * .smil file
 */
interface Par {
  // element id
  textDOMId: string
  // unit: s
  clipBegin: number
  clipEnd: number
}

interface SmilAudio {
  audioSrc: string
  pars: Par[]
}

type SmilAudios = SmilAudio[]

declare function initEpubFile(epubPath: InputFile, resourceSaveDir?: string, options?: EpubFileOptions): Promise<EpubFile>;
/**
 * The class EpubFile is an epub file parse manager.
 * It has a ZipFile instance used to read files in epub file. Its function
 *  is to read and parse(xml) the content of epub file and then hand it
 *  over to other functions for processing. Finally, the infomation extracted
 *  from epub file is stored in the form of EpubFile class attributes.
 */
declare class EpubFile implements EBookParser {
    private epub;
    private options;
    private fileName;
    private mimeType;
    getFileInfo(): EpubFileInfo;
    /**
     * <metadata> in .opf file
     */
    private metadata?;
    getMetadata(): EpubMetadata;
    /**
     * <manifest> in .opf file
     */
    private manifest;
    getManifest(): Record<string, ManifestItem>;
    /**
     * <spine> in .opf file
     */
    private spine;
    getSpine(): EpubSpine;
    /**
     * <guide> in .opf file
     */
    private guide;
    getGuide(): EpubGuide;
    /**
     * <collection> in .opf file
     */
    private collections;
    getCollection(): EpubCollection;
    /**
     * <navMap> in .ncx file
     *  which is default value if there is no <navMap> in epub file
     */
    private navMap;
    getToc(): EpubToc;
    /**
     * <pageList> in .ncx file
     *  which is default value if there is no <pageList> in epub file
     */
    private pageList;
    getPageList(): PageList;
    /**
     * <navList> in .ncx file,
     *  which is default value if there is no <navList> in epub file
     */
    private navList;
    getNavList(): NavList;
    /**
     * zip processing class
     */
    private zip;
    private opfPath;
    private opfDir;
    private resourceSaveDir;
    private encryptionKeys;
    constructor(epub: InputFile, resourceSaveDir?: string, options?: EpubFileOptions);
    loadEpub(): Promise<void>;
    parse(): Promise<void>;
    private savedResourcePath;
    private hrefToIdMap;
    /**
     * parse .opf file
     */
    private parseRootFile;
    private chapterCache;
    /**
     * replace <img> src absolute path or blob url
     * @param id the manifest item id of the chapter
     * @returns replaced html string
     */
    loadChapter(id: string): Promise<EpubProcessedChapter>;
    resolveHref(href: string): EpubResolvedHref | undefined;
    getCoverImage(): string;
    destroy(): void;
}

declare const HREF_PREFIX = "epub:";

export { type AesName, type CollectionItem, type Contributor, HREF_PREFIX as EPUB_HREF_PREFIX, type EncryptionKeys, type EpubCollection, type EpubCssPart, EpubFile, type EpubFileInfo, type EpubFileOptions, type EpubGuide, type EpubMetadata, type EpubProcessedChapter, type EpubResolvedHref, type EpubSpine, type EpubToc, type FileProcessor, type GuideReference, type IdToKey, type Identifier, type Link, type ManifestItem, type NavList, type NavPoint, type NavTarget, type PageList, type PageTarget, type Par, type PathToProcessors, type RsaHash, type SmilAudio, type SmilAudios, type SpineItem, type Subject, initEpubFile };
