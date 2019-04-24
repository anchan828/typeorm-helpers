import { BinaryLike, createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { ValueTransformer } from 'typeorm';

type FilenameFunction = (filename: string) => string;

export interface StaticFileTransformerOptions {
  /**
   * Overwrite filename.
   */
  filename?: string | FilenameFunction;

  dirname: string;

  /**
   * Don't read data from file path. (Default: false)
   * Returns filePath when writeOnly is true.
   * Returns file data when writeOnly is false.
   */
  writeOnly?: boolean;

  // https://github.com/nodejs/node/blob/master/lib/buffer.js#L922
  encoding?:
    | 'ascii'
    | 'base64'
    | 'binary'
    | 'hex'
    | 'ucs2'
    | 'ucs-2'
    | 'utf16le'
    | 'utf-16le'
    | 'utf8'
    | 'utf-8'
    | 'latin1';
}

/**
 * Write/Read buffer/string/base64 file data
 */
export class StaticFileTransformer implements ValueTransformer {
  constructor(private options: Readonly<StaticFileTransformerOptions>) {
    if (!options.dirname) {
      throw new Error('Required dirname path or dirname function');
    }
  }
  public from(value?: string | null): BinaryLike | undefined {
    if (!value) {
      return;
    }
    if (value.startsWith(this.options.dirname)) {
      if (this.options.writeOnly) {
        return value;
      }
    } else {
      throw new Error(`${value} is not under the directory.`);
    }

    if (!existsSync(value)) {
      throw new Error(`${value} not found.`);
    }

    return readFileSync(value, this.options.encoding);
  }
  public to(value?: BinaryLike | null): string | undefined {
    if (!value) {
      return;
    }

    if (typeof value === 'string' && value.startsWith(this.options.dirname)) {
      return value;
    }

    let filename = this.createSHA1(value);

    if (this.options.filename) {
      if (typeof this.options.filename === 'string') {
        filename = this.options.filename;
      } else if (typeof this.options.filename === 'function') {
        filename = this.options.filename(filename);
      }
    }

    const filePath = join(this.options.dirname, filename);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, value, this.options.encoding);

    return filePath;
  }

  private createSHA1(value: BinaryLike): string {
    const shasum = createHash('sha1');
    return shasum.update(value).digest('hex');
  }
}
