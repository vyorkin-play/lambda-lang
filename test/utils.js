// @flow

import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';
import Parser from '../src/Parser';

export function createTokenStream(text: string): TokenStream {
  const input = new InputStream(text);
  return new TokenStream(input);
}

export function createParser(text: string): Parser {
  const tokenStream = createTokenStream(text);
  return new Parser(tokenStream);
}
