import test from 'ava';
import { createTokenStream } from './utils';

const input = `
  def sqr(x) {
    x * x;
  }
  def cube(y) {
    y * y * y;
  }
`;

test('sequantially reads tokens', t => {
  const stream = createTokenStream(input);

  t.deepEqual(stream.next(), { type: 'Keyword', value: 'def' });
  t.deepEqual(stream.next(), { type: 'Variable', value: 'sqr' });
  t.deepEqual(stream.next(), { type: 'Punctuation', value: '(' });
  t.deepEqual(stream.next(), { type: 'Variable', value: 'x' });
  t.deepEqual(stream.next(), { type: 'Punctuation', value: ')' });
  t.deepEqual(stream.next(), { type: 'Punctuation', value: '{' });
  t.deepEqual(stream.next(), { type: 'Variable', value: 'x' });
  t.deepEqual(stream.next(), { type: 'Operator', value: '*' });
  t.deepEqual(stream.next(), { type: 'Variable', value: 'x' });
  t.deepEqual(stream.next(), { type: 'Punctuation', value: ';' });
  t.deepEqual(stream.next(), { type: 'Punctuation', value: '}' });
});
