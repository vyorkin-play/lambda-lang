import test from 'ava';
import { createParser } from './utils';

test('correctly parses variables', t => {
  const parser = createParser('foo');
  const variable = parser.variable();
  t.is(variable, 'foo');
});

test('parses simple delimited expressions', t => {
  const parser = createParser('(a, b, c)');
  const values = parser.delimited(
    parser.variable, {
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

  const trueNode = trueParser.boolean();
  const falseNode = falseParser.boolean();

  t.deepEqual(trueNode, { type: 'Boolean', value: true });
  t.deepEqual(falseNode, { type: 'Boolean', value: false });
});

test('correctly parses assignment expression', t => {
  const parser = createParser('x = 42');
  const variable = parser.atom();
  const expr = parser.binary(variable);

  t.deepEqual(expr, {
    type: 'Assignment',
    lhs: { type: 'Variable', value: 'x' },
    rhs: { type: 'Number', value: 42 },
  });
});

test('parses one-liner conditions', t => {
  const parser = createParser('if x % 2 == 0 then 1 else 0');
  const condition = parser.condition();

  t.deepEqual(condition, {
    type: 'Condition',
    condition: {
      type: 'Binary',
      operator: '==',
      lhs: {
        type: 'Binary',
        operator: '%',
        lhs: { type: 'Variable', value: 'x' },
        rhs: { type: 'Number', value: 2 },
      },
      rhs: {
        type: 'Number',
        value: 0,
      },
    },
    then: { type: 'Number', value: 1 },
    else: { type: 'Number', value: 0 },
  });
});

test('is able to parse a simple lambda', t => {
  const parser = createParser('(x) { x * 2 }');
  const lambda = parser.lambda();

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

test('correctly parses complex lambdas', t => {
  const parser = createParser(`
    ( x,    y )   {
      z = x   * y;
      z -  4 }
  `);
  const lambda = parser.lambda();

  t.deepEqual(lambda, {
    type: 'Lambda',
    variables: ['x', 'y'],
    body: {
      type: 'Program',
      program: [
        {
          type: 'Assignment',
          lhs: {
            type: 'Variable',
            value: 'z',
          },
          rhs: {
            type: 'Binary',
            operator: '*',
            lhs: { type: 'Variable', value: 'x' },
            rhs: { type: 'Variable', value: 'y' },
          },
        },
        {
          type: 'Binary',
          operator: '-',
          lhs: { type: 'Variable', value: 'z' },
          rhs: { type: 'Number', value: 4 },
        },
      ],
    },
  });
});
