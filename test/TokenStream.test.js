import test from 'ava';
import { createTokenStream } from './utils';

const sqr = `
  def sqr(x) {
    x * x;
  }
`;

const absx2 = `
  def abs-x-2(x) {
    abs = if (x < 0) then -x else x;
    abs * 2
  }
`;

const helloWorld = `
  intro = "Hello ";
  def run(x) {
    intro + x + "!";
  }
  run("World");
`;

test('sequantially reads tokens', t => {
  const stream = createTokenStream(sqr);

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

  t.falsy(stream.eof());
  t.deepEqual(stream.next(), { type: 'Punctuation', value: '}' });
  t.truthy(stream.eof());
});
