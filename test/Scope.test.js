import test from 'ava';
import createScope from '../src/Scope';

test('resolves defined variable', t => {
  const scope = createScope();
  scope.define('foo', 1);

  t.is(scope.foo, 1);
});

test('an attempt to get a value of undefined variable results in error', t => {
  const scope = createScope();
  const error = t.throws(() => scope.foo, Error);

  t.is(error.message, `Undefined variable 'foo'`); // eslint-disable-line quotes
});

test('resolves variables defined in parent scope', t => {
  const scope = createScope();
  scope.define('x', 1);
  const nested = scope.nested();

  t.is(nested.x, 1);
});

test('correctly sets a value of previously defined variable', t => {
  const scope = createScope();

  // check out these awesome Czech metasyntactic variables
  scope.define('kuku', 'keke');
  scope.kuku = 'huhu';

  t.is(scope.kuku, 'huhu');
});

// throws an error in attempt to set a value of variable that was not defined
// previously
test('refuses to pollute parent scope from a nested scope', t => {
  const scope = createScope();
  const nested = scope.nested();

  const error = t.throws(() => { nested.azerty = 123; }, Error);
  t.is(error.message, `Undefined variable 'azerty'`); // eslint-disable-line quotes
});
