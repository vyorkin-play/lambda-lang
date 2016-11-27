import test from 'ava';
import { createParser } from './utils';

test('correctly parses variables', t => {
  const parser = createParser('foo');
  const variable = parser.parseVariable();
  t.is(variable, 'foo');
});

test('parses simple delimited expressions', t => {
  const parser = createParser('(a, b, c)');
  const values = parser.parseDelimited(
    parser.parseVariable, {
      start: '(',
      stop: ')',
      separator: ',',
    }
  );

  t.deepEqual(values, ['a', 'b', 'c']);
});

test('parses booleans', t => {
  const trueParser = createParser('true');
  const falseParser = createParser('false');

  const trueNode = trueParser.parseBoolean();
  const falseNode = falseParser.parseBoolean();

  t.deepEqual(trueNode, { type: 'Boolean', value: true });
  t.deepEqual(falseNode, { type: 'Boolean', value: false });
});


test('is able to parse simple lambda', t => {
  const parser = createParser('(x) { x * 2 }');
  const lambda = parser.parseLambda();

  t.deepEqual(lambda, {
    type: 'Lambda',
    variables: ['x'],
    body: {
      type: 'Binary',
      operator: '*',
      lhs: {
        type: 'Variable',
        value: 'x',
      },
      rhs: {
        type: 'Number',
        value: 2,
      },
    },
  });
});
