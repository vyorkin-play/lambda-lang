import test from 'ava';
import { createTokenStream } from './utils';

test('reads strings', t => {
  const stream = createTokenStream('"sup"');
  t.deepEqual(stream.next(), { type: 'String', value: 'sup' });
});

test('reads escaped strings', t => {
  const stream = createTokenStream('"one\\"two\'three"');
  t.deepEqual(stream.next(), { type: 'String', value: `one"two'three` }); // eslint-disable-line quotes
});

test('sequantially reads tokens', t => {
  const stream = createTokenStream(`
    def sqr(x) {
      x * x;
    }
  `);

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

test('treats special characters right', t => {
  const stream = createTokenStream('def even-abs?');

  t.deepEqual(stream.next(), { type: 'Keyword', value: 'def' });
  t.deepEqual(stream.next(), { type: 'Variable', value: 'even-abs?' });
});

test('skips comments', t => {
  const stream = createTokenStream(`
    # comment
    x # antoher comment
    # haha, it works
    y
  `);
  t.deepEqual(stream.next(), { type: 'Variable', value: 'x' });
  t.deepEqual(stream.next(), { type: 'Variable', value: 'y' });
});

