// @flow

import InputStream from './InputStream';

type Predicate = (token: string) => boolean;

export type TokenType =
  | 'Keyword'
  | 'Variable'
  | 'Number'
  | 'String'
  | 'Operator'
  | 'Punctuation';

export type Token = {
  type: TokenType,
  value: string | number,
};

/*
 * A simple lexer.
 */
export default class TokenStream {
  static keywords = ['if', 'then', 'else', 'def', 'true', 'false'];

  static isKeyword = (token: string) => TokenStream.keywords.includes(token);
  static isDigit = (char: string) => /[0-9]/i.test(char);
  static isOperator = (char: string) => '+-*/=%|&<>!'.includes(char);
  static isPunctuation = (char: string) => ',;(){}[]'.includes(char);
  static isWhiteSpace = (char: string) => ' \t\n'.includes(char);
  static isIdentifierStart = (char: string) => /[a-z]/i.test(char);
  static isIdentifier = (char: string) =>
    TokenStream.isIdentifierStart(char) ||
    TokenStream.isDigit(char) ||
    '-?!'.includes(char);

  input: InputStream;
  current: ?Token;

  constructor(input: InputStream) {
    this.input = input;
    this.current = null;
  }

  peek(): ?Token {
    if (!this.current) {
      this.current = this.read();
    }
    return this.current;
  }

  next(): ?Token {
    const token = this.current;
    this.current = null;
    return token || this.read();
  }

  eof(): boolean {
    return this.peek() === null;
  }

  error(message: string) {
    return this.input.error(message);
  }

  read(): ?Token {
    this.readWhile(TokenStream.isWhiteSpace);
    if (this.input.eof()) return null;

    const char = this.input.peek();
    if (char === '#') {
      this.skipComment();
      return this.read();
    }

    if (char === '"') return this.string();
    if (TokenStream.isDigit(char)) return this.number();
    if (TokenStream.isIdentifierStart(char)) return this.identifier();
    if (TokenStream.isPunctuation(char)) {
      return {
        type: 'Punctuation',
        value: this.input.next(),
      };
    }
    if (TokenStream.isOperator(char)) {
      return {
        type: 'Operator',
        value: this.readWhile(TokenStream.isOperator),
      };
    }

    throw this.error(`Unexpected character: ${char}`);
  }

  string(): Token {
    return {
      type: 'String',
      value: this.escaped('"'),
    };
  }

  escaped(endChar: string): string {
    let escaped = false;
    let result = '';

    this.input.next();

    while (!this.input.eof()) {
      const char = this.input.next();
      if (escaped) {
        result += char;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === endChar) {
        break;
      } else {
        result += char;
      }
    }

    return result;
  }

  number(): Token {
    let isFloat = false;
    const result = this.readWhile(char => {
      if (char === '.') {
        if (isFloat) return false;
        isFloat = true;
      }
      return TokenStream.isDigit(char);
    });

    return {
      type: 'Number',
      value: parseFloat(result),
    };
  }

  identifier(): Token {
    const value = this.readWhile(TokenStream.isIdentifier);
    const type = TokenStream.isKeyword(value) ? 'Keyword' : 'Variable';
    return { type, value };
  }

  readWhile(predicate: Predicate) {
    let result = '';
    while (!this.input.eof() && predicate(this.input.peek())) {
      result += this.input.next();
    }
    return result;
  }

  skipComment() {
    this.readWhile((char: string) => char !== '\n');
    this.input.next();
  }
}
