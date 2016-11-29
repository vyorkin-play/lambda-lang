import test from 'ava';
import createScope from '../src/Scope';
import evaluate from '../src/evaluate';
import { parse, e } from './utils';

test('evaluates constant values', t => {
  const digit = evaluate({ type: 'Number', value: 5 });
  const text = evaluate({ type: 'String', value: 'hello' });
  const bool = evaluate({ type: 'Boolean', value: true });

  t.is(digit, 5);
  t.is(text, 'hello');
  t.is(bool, true);
});

test('evaluates a sum of two numbers', t => {
  const sum = evaluate({
    type: 'Binary',
    operator: '+',
    lhs: { type: 'Number', value: 3 },
    rhs: { type: 'Number', value: 10 },
  });

  t.is(sum, 13);
});

test('evaluates simple binary arithmetic expressions', t => {
  t.is(e('3 + 5'), 8);
  t.is(e('8 - 5'), 3);
  t.is(e('2 * 21'), 42);
  t.is(e('84 / 2'), 42);
  t.is(e('4 % 2'), 0);
  t.is(e('9 % 2'), 1);

  const err1 = t.throws(() => e('2 / 0'), Error);
  t.is(err1.message, 'Divide by zero');

  const err2 = t.throws(() => e('2 % 0'), Error);
  t.is(err2.message, 'Divide by zero');
});

test('evaluates complex arithmetic expressions', t => {
  t.is(e('3 + 3 * 3'), 12);
  t.is(e('10 - 2 * 8 / 2'), 2);
});

test('evaluates simple binary logic expressions', t => {
  t.is(e('true && true'), true);
  t.is(e('false && true'), false);
  t.is(e('true && false'), false);
  t.is(e('false && false'), false);

  t.is(e('true || true'), true);
  t.is(e('false || true'), true);
  t.is(e('true || false'), true);
  t.is(e('false || false'), false);
});

test('evaluates simple comparison expressions', t => {
  t.is(e('5 > 4'), true);
  t.is(e('5 > 6'), false);

  t.is(e('81 >= 42'), true);
  t.is(e('12 >= 64'), false);

  t.is(e('7 < 3'), false);
  t.is(e('9 < 74'), true);

  t.is(e('84 <= 3'), false);
  t.is(e('91 <= 123'), true);
});

test('evaluates simple equality expressions', t => {
  t.is(e('42 == 42'), true);
  t.is(e('42 == 24'), false);

  t.is(e('42 != 42'), false);
  t.is(e('42 != 24'), true);
});

test('evaluates assignment expressions', t => {
  const scope = createScope();
  const expression = parse('x = 5');
  const result = evaluate(expression, scope);

  t.is(result, 5);
});

test('evaluates variable expressions', t => {
  const scope = createScope();
  const assignment = parse('x = 5');
  evaluate(assignment, scope);
  const variable = parse('x');
  const result = evaluate(variable, scope);

  t.is(result, 5);
});

test('evaluates simple conditional expressions', t => {
  t.is(e('if false then 1 else 2'), 2);
  t.is(e('if 2 > 1 then 4 else 8'), 4);
});

test('evaluates a simple program', t => {
  const program = `
    sqr = def(x) x * x;
    sqr(4)
  `;
  t.is(e(program), 16);
});

test('evaluates a complex program', t => {
  const program = `
    sqr = def(x) x * x;
    cube = def(x) x * x * x;
    z = 4;
    x = 8;
    y = 5;
    cube(z + x) - sqr(y) + 2
  `;
  // 12 * 12 * 12 - 5*5 + 2
  t.is(e(program), 1705);
});
