// @flow

import InputStream from './InputStream';

type Predicate = (token: string) => boolean;
type Token = {
  type: string,
  value: string | number,
};

export default class TokenStream {
  static keywords = ['if', 'then', 'else', 'def', 'true', 'false'];

  static isKeyword = (token: string) => TokenStream.keywords.includes(token);
  static isDigit = (char: string) => /[0-9]/i.test(char);
  static isOperator = (char: string) => '+-*/=%|<>!'.includes(char);
  static isPunctuation = (char: string) => ',;(){}[]'.includes(char);
  static isWhiteSpace = (char: string) => ' \t\n'.includes(char);
  static isIdentifierStart = (char: string) => /[a-z]/i.test(char);
  static isIdentifier = (char: string) =>
    TokenStream.isIdentifierStart(char) ||
    TokenStream.isDigit(char) ||
    '?!'.includes(char);

  input: InputStream;
  current: ?Token;

  constructor(input: InputStream) {
    this.input = input;
    this.current = null;
  }

  peek(): ?Token {
    if (!this.current) {
      this.current = this.readNext();
    }
    return this.current;
  }

  next(): ?Token {
    const token = this.current;
    this.current = null;
    return token || this.readNext();
  }

  eof(): boolean {
    return this.peek() === null;
  }

  croak(message: string) {
    return this.input.croak(message);
  }

  readNext(): ?Token {
    this.readWhile(TokenStream.isWhiteSpace);
    if (this.input.eof()) return null;

    const char = this.input.peek();
    if (char === '#') {
      this.skipComment();
      return this.readNext();
    }

    if (char === '"') return this.readString();
    if (TokenStream.isDigit(char)) return this.readNumber();
    if (TokenStream.isIdentifierStart(char)) return this.readIdentifier();
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

    this.input.croak(`Unexpected character: ${char}`);

    return null;
  }

  readString(): Token {
    return {
      type: 'String',
      value: this.readEscaped('"'),
    };
  }

  readEscaped(endChar: string): string {
    let escaped = false;
    let result = '';
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

  readNumber(): Token {
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

  readIdentifier(): Token {
    const result = this.readWhile(TokenStream.isIdentifier);
    return {
      type: TokenStream.isKeyword(result) ? 'Keyword' : 'Variable',
      value: result,
    };
  }

  readWhile(predicate: Predicate) {
    let result = '';
    while (!this.input.eof() && predicate(this.input.peek())) {
      result += this.input.next();
    }
    return result;
  }

  skipComment() {
    this.readWhile(TokenStream.isWhiteSpace);
    this.input.next();
  }
}
