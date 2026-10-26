import {createWriteStream, WriteStream} from 'node:fs';
import {once} from 'node:events';

export class TSVFileWriter {
  private readonly stream: WriteStream;

  constructor(filePath: string) {
    this.stream = createWriteStream(filePath, {flags: 'w', encoding: 'utf-8'});
  }

  public async write(row: string): Promise<void> {
    if (!this.stream.write(`${row}\n`)) {
      await once(this.stream, 'drain');
    }
  }

  public async close(): Promise<void> {
    this.stream.end();
    await once(this.stream, 'finish');
  }
}
