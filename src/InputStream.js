// @flow

export class InputStreamError extends Error {
  line: number;
  column: number;

  constructor(message: string, line: number, column: number) {
    super(`${message} (${line}:${column})`);
    this.message = message;
    this.line = line;
    this.column = column;
  }
}

export default class InputStream {
  input: string;
  pos: number;
  line: number;
  column: number;

  constructor(input: string) {
    this.input = input;
    this.reset();
  }

  peek(): string {
    return this.input.charAt(this.pos);
  }

  next(): string {
    const char = this.input[this.pos++];
    if (char === '\n') {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }
    return char;
  }

  eof(): boolean {
    return this.peek() === '';
  }

  croak(message: string) {
    throw new InputStreamError(
      message,
      this.line,
      this.column
    );
  }

  reset() {
    this.pos = 0;
    this.line = 1;
    this.column = 0;
  }
}
