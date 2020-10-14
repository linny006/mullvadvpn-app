declare module 'gettext-parser' {
  export namespace po {
    export function parse(input: string | Buffer, defaultCharset?: string): Record<string, unknown>;
  }
}
