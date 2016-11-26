import test from 'ava';
import InputStream from '../src/InputStream';

const input = `def foo(test) {
  console.log("hello world!");
}
`;

function createStream() {
  return new InputStream(input);
}

test('has a valid initial state', t => {
  const stream = createStream();

  t.is(stream.length, input.length);
  t.is(stream.pos, 0);
  t.is(stream.line, 1);
  t.is(stream.column, 0);
  t.is(stream.input, input);
});

test('advances forward by one char at a time', t => {
  const stream = createStream();

  t.is(stream.next(), 'd');
  t.is(stream.pos, 1);
  t.is(stream.line, 1);
  t.is(stream.column, 1);
  t.is(stream.next(), 'e');
  t.is(stream.pos, 2);
  t.is(stream.line, 1);
  t.is(stream.column, 2);
});

test('correctly handles line breaks', t => {
  const stream = createStream();
  for (let i = 0; i < 15; i++) {
    stream.next();
  }

  t.is(stream.peek(), '\n');
  t.is(stream.line, 1);
  t.is(stream.pos, 15);
  t.is(stream.column, 15);

  stream.next();

  t.is(stream.line, 2);
  t.is(stream.pos, 16);
  t.is(stream.column, 0);
});

test('peek works as expected', t => {
  const stream = createStream();
  stream.next();
  stream.next();
  stream.next();

  t.is(stream.pos, 3);
  t.is(stream.column, 3);
  t.is(stream.peek(), ' ');
  t.is(stream.pos, 3);
  t.is(stream.column, 3);
});

test('correctly reports eof', t => {
  const stream = createStream();
  for (let i = 0; i < stream.length - 1; i++) {
    stream.next();
  }

  t.falsy(stream.eof());
  stream.next();
  t.truthy(stream.eof());
});

test('croak throws a valid error message', t => {
  const stream = createStream();
  for (let i = 0; i < 10; i++) {
    stream.next();
  }

  const error = t.throws(() => stream.croak('fucked up'), Error);
  t.is(error.toString(), 'Error: fucked up (1:10)');
});

