// @flow

/*
 * A simple lexical scope.
 */
class Scope {
  variables: any;
  parent: ?Scope;

  constructor(parent: ?Scope) {
    this.parent = parent;
    this.variables = Object.create(parent ? parent.variables : null);
  }

  /*
   * Creates a new nested scope.
   */
  nested(): Scope {
    return createScope(this);
  }

  /*
   * Lookup the actual scope
   * where the variable is defined.
   */
  lookup(name: string): ?Scope {
    let current = this;
    while (current) {
      if (hasOwnProperty(current.variables, name)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  /*
   * Creates (shadows, overwrites) a variable
   * in the current scope.
   */
  define(name: string, value: any) {
    this.variables[name] = value;
  }
}

export default function createScope(parent: ?Scope = null): Scope {
  const target = new Scope(parent);
  return new Proxy(target, resolver);
}

const passthroughProps = [
  'parent',
  'variables',
  'nested',
  'lookup',
  'define',
];

const resolver = {
  get(target: Scope, property: string): any {
    if (passthroughProps.includes(property)) {
      const indexable = (target: any);
      return indexable[property];
    }
    if (property in target.variables) {
      return target.variables[property];
    }
    throw new Error(`Undefined variable '${property}'`);
  },

  set(target: Scope, property: string, value: any): boolean {
    const owner = target.lookup(property);

    if (!owner && target.parent) {
      // actual scope where the variable is defined
      // is not found and we're not in the global scope.
      throw new Error(`Undefined variable '${property}'`);
    }

    const scope = owner || target;
    scope.variables[property] = value; // eslint-disable-line no-param-reassign
    return true;
  },
};

function hasOwnProperty(context: any, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(context, name);
}
