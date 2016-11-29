// @flow

import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';
import Parser from '../src/Parser';
import type { AST } from '../src/Parser';
import createScope from '../src/Scope';
import evaluate from '../src/evaluate';

export function createTokenStream(text: string): TokenStream {
  const input = new InputStream(text);
  return new TokenStream(input);
}

export function createParser(text: string): Parser {
  const tokenStream = createTokenStream(text);
  return new Parser(tokenStream);
}

export function parse(text: string): AST {
  const parser = createParser(text);
  return parser.parse();
}

export function e(text: string): any {
  const parser = createParser(text);
  const expression = parser.parse();
  const scope = createScope();
  return evaluate(expression, scope);
}
