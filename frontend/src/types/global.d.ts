// Type declarations for packages without proper TypeScript support

declare module 'papaparse' {
  export interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    transformHeader?: (header: string) => string;
    dynamicTyping?: boolean | { [key: string]: boolean };
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult, parser: Parser) => void;
    complete?: (results: ParseResult) => void;
    error?: (error: ParseError) => void;
    download?: boolean;
    downloadRequestHeaders?: { [key: string]: string };
    downloadRequestBody?: any;
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult, parser: Parser) => void;
    fastMode?: boolean;
    beforeFirstChunk?: (chunk: string) => string | void;
    withCredentials?: boolean;
    transform?: (value: string, field: string | number) => any;
    delimitersToGuess?: string[];
  }

  export interface ParseResult {
    data: any[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    fields?: string[];
    truncated: boolean;
  }

  export interface Parser {
    parse: (input: string, config?: ParseConfig) => ParseResult;
    abort: () => void;
    resume: () => void;
    pause: () => void;
  }

  export function parse(input: string | File, config?: ParseConfig): ParseResult;
  export function unparse(data: any[], config?: ParseConfig): string;
}

declare module 'file-saver' {
  export function saveAs(blob: Blob, filename?: string): void;
  export function saveAs(url: string, filename?: string): void;
}