import test from 'ava';
import { E } from './utils';
import evaluate from '../src/evaluate';

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
  t.is(E('3 + 5'), 8);
  t.is(E('8 - 5'), 3);
  t.is(E('2 * 21'), 42);
  t.is(E('84 / 2'), 42);
  t.is(E('4 % 2'), 0);
  t.is(E('9 % 2'), 1);

  const err1 = t.throws(() => E('2 / 0'), Error);
  t.is(err1.message, 'Divide by zero');

  const err2 = t.throws(() => E('2 % 0'), Error);
  t.is(err2.message, 'Divide by zero');
});

test('evaluates simple binary logic expressions', t => {
  t.is(E('true && true'), true);
  t.is(E('false && true'), false);
  t.is(E('true && false'), false);
  t.is(E('false && false'), false);

  t.is(E('true || true'), true);
  t.is(E('false || true'), true);
  t.is(E('true || false'), true);
  t.is(E('false || false'), false);
});

test('evaluates simple comparison expressions', t => {
  t.is(E('5 > 4'), true);
  t.is(E('5 > 6'), false);

  t.is(E('81 >= 42'), true);
  t.is(E('12 >= 64'), false);

  t.is(E('7 < 3'), false);
  t.is(E('9 < 74'), true);

  t.is(E('84 <= 3'), false);
  t.is(E('91 <= 123'), true);
});

test('evaluates simple equality expressions', t => {
  t.is(E('42 == 42'), true);
  t.is(E('42 == 24'), false);

  t.is(E('42 != 42'), false);
  t.is(E('42 != 24'), true);
});
