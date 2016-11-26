// @flow

export default class InputStream {
  input: string;
  pos: number;
  line: number;
  column: number;

  constructor(input: string) {
    this.input = input;
    this.reset();
  }

  get length(): number {
    return this.input.length;
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
    throw new Error(`${message} (${this.line}:${this.column})`);
  }

  reset() {
    this.pos = 0;
    this.line = 1;
    this.column = 0;
  }
}
