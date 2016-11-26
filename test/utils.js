// @flow

import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';

/* eslint-disable import/prefer-default-export */
export function createTokenStream(text: string): TokenStream {
  const input = new InputStream(text);
  return new TokenStream(input);
}
/* eslint-enable import/prefer-default-export */
