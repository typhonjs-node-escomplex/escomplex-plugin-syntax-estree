'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AbstractSyntaxLoader2 = require('escomplex-core-commons/dist/plugin/syntax/AbstractSyntaxLoader.js');

var _AbstractSyntaxLoader3 = _interopRequireDefault(_AbstractSyntaxLoader2);

var _actualise = require('escomplex-core-commons/dist/traits/actualise.js');

var _actualise2 = _interopRequireDefault(_actualise);

var _safeName = require('escomplex-core-commons/dist/traits/safeName.js');

var _safeName2 = _interopRequireDefault(_safeName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var amdPathAliases = {};

/**
 * Provides escomplex trait resolution for all ESTree AST nodes up to and including ES6.
 */

var PluginSyntaxESTree = function (_AbstractSyntaxLoader) {
  _inherits(PluginSyntaxESTree, _AbstractSyntaxLoader);

  function PluginSyntaxESTree() {
    _classCallCheck(this, PluginSyntaxESTree);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PluginSyntaxESTree).apply(this, arguments));
  }

  _createClass(PluginSyntaxESTree, [{
    key: 'onConfigure',

    /**
     * Loads any default settings that are not already provided by any user options.
     *
     * @param {object}   ev - escomplex plugin event data.
     */
    value: function onConfigure(ev) {
      ev.data.settings.logicalor = typeof ev.data.options.logicalor === 'boolean' ? ev.data.options.logicalor : true;
      ev.data.settings.switchcase = typeof ev.data.options.switchcase === 'boolean' ? ev.data.options.switchcase : true;
      ev.data.settings.forin = typeof ev.data.options.forin === 'boolean' ? ev.data.options.forin : false;
      ev.data.settings.trycatch = typeof ev.data.options.trycatch === 'boolean' ? ev.data.options.trycatch : false;
    }

    // Core / ES5 ESTree AST nodes -----------------------------------------------------------------------------------

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#arrayexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ArrayExpression',
    value: function ArrayExpression() {
      return (0, _actualise2.default)(0, 0, '[]');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#assignmentexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'AssignmentExpression',
    value: function AssignmentExpression() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.operator;
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#blockstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'BlockStatement',
    value: function BlockStatement() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#binaryexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'BinaryExpression',
    value: function BinaryExpression() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.operator;
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#breakstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'BreakStatement',
    value: function BreakStatement() {
      return (0, _actualise2.default)(1, 0, 'break');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#callexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'CallExpression',
    value: function CallExpression() {
      return (0, _actualise2.default)(function (node) {
        return node.callee.type === 'FunctionExpression' ? 1 : 0;
      }, // lloc
      0, // cyclomatic
      '()', // operators
      undefined, // operands
      undefined, // ignoreKeys
      undefined, // newScope
      function (node, clearAliases) {
        // TODO: This prohibits async running. Refine by passing in module id as key for amdPathAliases.
        if (clearAliases) {
          amdPathAliases = {};
        }

        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          return processRequire(node);
        }

        if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'require' && node.callee.property.type === 'Identifier' && node.callee.property.name === 'config') {
          processAmdRequireConfig(node.arguments);
        }
      });

      /**
       * @param {object}   node - AST node
       * @returns {*}
       */
      function processRequire(node) {
        if (node.arguments.length === 1) {
          return processCommonJsRequire(node);
        }
        if (node.arguments.length === 2) {
          return processAmdRequire(node);
        }
      }

      /**
       * @param {object}   node - AST node
       * @returns {{line, path, type}|*}
       */
      function processCommonJsRequire(node) {
        return createDependency(node, resolveRequireDependency(node.arguments[0]), 'cjs');
      }

      /**
       * Note: that `StringLiteral` supports Babylon AST.
       * @param {object}   dependency -
       * @param {function} resolver -
       * @returns {*}
       */
      function resolveRequireDependency(dependency, resolver) {
        if (dependency.type === 'Literal' || dependency.type === 'StringLiteral') {
          if (typeof resolver === 'function') {
            return resolver(dependency.value);
          }

          return dependency.value;
        }

        return '* dynamic dependency *';
      }

      /**
       * @param {object}   node - AST node
       * @param {string}   path - path to dependency
       * @param {string}   type - dependency type
       * @returns {{line: *, path: *, type: *}}
       */
      function createDependency(node, path, type) {
        return { line: node.loc.start.line, path: path, type: type };
      }

      /**
       * @param {object}   node - AST node
       * @returns {*}
       */
      function processAmdRequire(node) {
        if (node.arguments[0].type === 'ArrayExpression') {
          return node.arguments[0].elements.map(processAmdRequireItem.bind(null, node));
        }

        // Note: that `StringLiteral` supports Babylon AST.
        if (node.arguments[0].type === 'Literal' || node.arguments[0].type === 'StringLiteral') {
          return processAmdRequireItem(node, node.arguments[0]);
        }

        return createDependency(node, '* dynamic dependencies *', 'amd');
      }

      /**
       * @param {object}   node - AST node
       * @param {string}   item - path or alias
       * @returns {{line: *, path: *, type: *}}
       */
      function processAmdRequireItem(node, item) {
        return createDependency(node, resolveRequireDependency(item, resolveAmdRequireDependency), 'amd');
      }

      /**
       * @param {string}   dependency - path or alias
       * @returns {*}
       */
      function resolveAmdRequireDependency(dependency) {
        return amdPathAliases[dependency] || dependency;
      }

      /**
       * @param {Array} args -
       */
      function processAmdRequireConfig(args) {
        if (args.length === 1 && args[0].type === 'ObjectExpression') {
          args[0].properties.forEach(processAmdRequireConfigProperty);
        }
      }

      /**
       * @param {object}   property -
       */
      function processAmdRequireConfigProperty(property) {
        if (property.key.type === 'Identifier' && property.key.name === 'paths' && property.value.type === 'ObjectExpression') {
          property.value.properties.forEach(setAmdPathAlias);
        }
      }

      /**
       * Note: that `StringLiteral` supports Babylon AST.
       * @param {object}   alias -
       */
      function setAmdPathAlias(alias) {
        if (alias.key.type === 'Identifier' && (alias.value.type === 'Literal' || alias.value.type === 'StringLiteral')) {
          amdPathAliases[alias.key.name] = alias.value.value;
        }
      }
    }

    /**
     * ES5 Node
     * @param {object}   settings - escomplex settings
     * @see https://github.com/estree/estree/blob/master/spec.md#catchclause
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'CatchClause',
    value: function CatchClause(settings) {
      return (0, _actualise2.default)(1, function () {
        return settings.trycatch ? 1 : 0;
      }, 'catch');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#conditionalexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ConditionalExpression',
    value: function ConditionalExpression() {
      return (0, _actualise2.default)(0, 1, ':?');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#continuestatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ContinueStatement',
    value: function ContinueStatement() {
      return (0, _actualise2.default)(1, 0, 'continue');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#dowhilestatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'DoWhileStatement',
    value: function DoWhileStatement() {
      return (0, _actualise2.default)(2, function (node) {
        return node.test ? 1 : 0;
      }, 'dowhile');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#emptystatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'EmptyStatement',
    value: function EmptyStatement() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#expressionstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ExpressionStatement',
    value: function ExpressionStatement() {
      return (0, _actualise2.default)(1, 0);
    }

    /**
     * ES5 Node
     * @param {object}   settings - escomplex settings
     * @see https://github.com/estree/estree/blob/master/spec.md#forinstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ForInStatement',
    value: function ForInStatement(settings) {
      return (0, _actualise2.default)(1, function () {
        return settings.forin ? 1 : 0;
      }, 'forin');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#forstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ForStatement',
    value: function ForStatement() {
      return (0, _actualise2.default)(1, function (node) {
        return node.test ? 1 : 0;
      }, 'for');
    }

    /**
     * ES5 Node
     *
     * Note: The function name (node.id) is returned as an operand and excluded from traversal as to not be included in
     * the function operand calculations.
     *
     * @see https://github.com/estree/estree/blob/master/spec.md#functiondeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'FunctionDeclaration',
    value: function FunctionDeclaration() {
      return (0, _actualise2.default)(1, 0, function (node) {
        return typeof node.generator === 'boolean' && node.generator ? 'generatorfunction' : 'function';
      }, function (node, parent) {
        return parent && parent.type === 'MethodDefinition' ? (0, _safeName2.default)(parent.key) : (0, _safeName2.default)(node.id);
      }, 'id', true);
    }

    /**
     * ES5 Node
     *
     * Note: The function name (node.id) is returned as an operand and excluded from traversal as to not be included in
     * the function operand calculations.
     *
     * @see https://github.com/estree/estree/blob/master/spec.md#functionexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'FunctionExpression',
    value: function FunctionExpression() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return typeof node.generator === 'boolean' && node.generator ? 'generatorfunction' : 'function';
      }, function (node, parent) {
        return parent && parent.type === 'MethodDefinition' ? (0, _safeName2.default)(parent.key) : (0, _safeName2.default)(node.id);
      }, 'id', true);
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#identifier
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'Identifier',
    value: function Identifier() {
      return (0, _actualise2.default)(0, 0, undefined, function (node) {
        return node.name;
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#ifstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'IfStatement',
    value: function IfStatement() {
      return (0, _actualise2.default)(function (node) {
        return node.alternate ? 2 : 1;
      }, 1, ['if', { identifier: 'else', filter: function filter(node) {
          return !!node.alternate;
        } }]);
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#labeledstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'LabeledStatement',
    value: function LabeledStatement() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES5 Node
     *
     * Avoid conflicts between string literals and identifiers.
     *
     * @see https://github.com/estree/estree/blob/master/spec.md#literal
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'Literal',
    value: function Literal() {
      return (0, _actualise2.default)(0, 0, undefined, function (node) {
        return typeof node.value === 'string' ? '"' + node.value + '"' : node.value;
      });
    }

    /**
     * ES5 Node
     * @param {object}   settings - escomplex settings
     * @see https://github.com/estree/estree/blob/master/spec.md#logicalexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'LogicalExpression',
    value: function LogicalExpression(settings) {
      return (0, _actualise2.default)(0, function (node) {
        var isAnd = node.operator === '&&';
        var isOr = node.operator === '||';
        return isAnd || settings.logicalor && isOr ? 1 : 0;
      }, function (node) {
        return node.operator;
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#memberexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'MemberExpression',
    value: function MemberExpression() {
      return (0, _actualise2.default)(function (node) {
        return ['ObjectExpression', 'ArrayExpression', 'FunctionExpression'].indexOf(node.object.type) === -1 ? 0 : 1;
      }, 0, '.');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#newexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'NewExpression',
    value: function NewExpression() {
      return (0, _actualise2.default)(function (node) {
        return node.callee.type === 'FunctionExpression' ? 1 : 0;
      }, 0, 'new');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#objectexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ObjectExpression',
    value: function ObjectExpression() {
      return (0, _actualise2.default)(0, 0, '{}');
    }

    /**
     * ES5 Node
     *
     * Note that w/ ES6+ `:` may be omitted and the Property node defines `shorthand` to indicate this case.
     *
     * @see https://github.com/estree/estree/blob/master/spec.md#property
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'Property',
    value: function Property() {
      return (0, _actualise2.default)(1, 0, function (node) {
        return typeof node.shorthand === 'undefined' ? ':' : typeof node.shorthand === 'boolean' && !node.shorthand ? ':' : undefined;
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#returnstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ReturnStatement',
    value: function ReturnStatement() {
      return (0, _actualise2.default)(1, 0, 'return');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#sequenceexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'SequenceExpression',
    value: function SequenceExpression() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES5 Node
     * @param {object}   settings - escomplex settings
     * @see https://github.com/estree/estree/blob/master/spec.md#switchcase
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'SwitchCase',
    value: function SwitchCase(settings) {
      return (0, _actualise2.default)(1, function (node) {
        return settings.switchcase && node.test ? 1 : 0;
      }, function (node) {
        return node.test ? 'case' : 'default';
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#switchstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'SwitchStatement',
    value: function SwitchStatement() {
      return (0, _actualise2.default)(1, 0, 'switch');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#thisexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ThisExpression',
    value: function ThisExpression() {
      return (0, _actualise2.default)(0, 0, undefined, 'this');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#throwstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ThrowStatement',
    value: function ThrowStatement() {
      return (0, _actualise2.default)(1, 0, 'throw');
    }

    /**
     * ES5 Node
     *
     * Note: esprima has duplicate nodes the catch block; `handler` is the actual ESTree spec.
     *
     * @see https://github.com/estree/estree/blob/master/spec.md#trystatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'TryStatement',
    value: function TryStatement() {
      return (0, _actualise2.default)(1, 0, undefined, undefined, ['guardedHandlers', 'handlers']);
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#unaryexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'UnaryExpression',
    value: function UnaryExpression() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.operator + ' (' + (node.prefix ? 'pre' : 'post') + 'fix)';
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#updateexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'UpdateExpression',
    value: function UpdateExpression() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.operator + ' (' + (node.prefix ? 'pre' : 'post') + 'fix)';
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#variabledeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'VariableDeclaration',
    value: function VariableDeclaration() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.kind;
      });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#variabledeclarator
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'VariableDeclarator',
    value: function VariableDeclarator() {
      return (0, _actualise2.default)(1, 0, { identifier: '=', filter: function filter(node) {
          return !!node.init;
        } });
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#whilestatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'WhileStatement',
    value: function WhileStatement() {
      return (0, _actualise2.default)(1, function (node) {
        return node.test ? 1 : 0;
      }, 'while');
    }

    /**
     * ES5 Node
     * @see https://github.com/estree/estree/blob/master/spec.md#withstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'WithStatement',
    value: function WithStatement() {
      return (0, _actualise2.default)(1, 0, 'with');
    }

    // ES6 ESTree AST nodes ------------------------------------------------------------------------------------------

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#assignmentpattern
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'AssignmentPattern',
    value: function AssignmentPattern() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.operator;
      }, undefined, function (node) {
        return node.left.type === 'MemberExpression' ? (0, _safeName2.default)(node.left.object) + '.' + node.left.property.name : typeof node.left.id !== 'undefined' ? (0, _safeName2.default)(node.left.id) : (0, _safeName2.default)(node.left);
      });
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#arraypattern
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ArrayPattern',
    value: function ArrayPattern() {
      return (0, _actualise2.default)(0, 0, '[]');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#arrowfunctionexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ArrowFunctionExpression',
    value: function ArrowFunctionExpression() {
      return (0, _actualise2.default)(0, 0, 'arrowfunction', undefined, undefined, true);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#classbody
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ClassBody',
    value: function ClassBody() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#classdeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ClassDeclaration',
    value: function ClassDeclaration() {
      return (0, _actualise2.default)(1, 0, 'class');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#classexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ClassExpression',
    value: function ClassExpression() {
      return (0, _actualise2.default)(1, 0, 'class');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#exportalldeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ExportAllDeclaration',
    value: function ExportAllDeclaration() {
      return (0, _actualise2.default)(0, 0, ['export', '*']);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#exportdefaultdeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ExportDefaultDeclaration',
    value: function ExportDefaultDeclaration() {
      return (0, _actualise2.default)(0, 0, ['export', 'default']);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#exportnameddeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ExportNamedDeclaration',
    value: function ExportNamedDeclaration() {
      return (0, _actualise2.default)(0, 0, ['export', '{}']);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#exportspecifier
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ExportSpecifier',
    value: function ExportSpecifier() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.exported.name === node.local.name ? undefined : 'as';
      });
    }

    /**
     * ES6 Node
     * @param {object}   settings - escomplex settings
     * @see https://github.com/estree/estree/blob/master/es6.md#forofstatement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ForOfStatement',
    value: function ForOfStatement(settings) {
      return (0, _actualise2.default)(1, function () {
        return settings.forin ? 1 : 0;
      }, 'forof');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#importdeclaration
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ImportDeclaration',
    value: function ImportDeclaration() {
      return (0, _actualise2.default)(0, 0, ['import', 'from'], undefined, undefined, undefined, function (node) {
        return { line: node.source.loc.start.line, path: node.source.value, type: 'esm' };
      });
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#importdefaultspecifier
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ImportDefaultSpecifier',
    value: function ImportDefaultSpecifier() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#importnamespacespecifier
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ImportNamespaceSpecifier',
    value: function ImportNamespaceSpecifier() {
      return (0, _actualise2.default)(0, 0, ['import', '*', 'as']);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#importspecifier
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ImportSpecifier',
    value: function ImportSpecifier() {
      return (0, _actualise2.default)(0, 0, function (node) {
        return node.imported.name === node.local.name ? '{}' : ['{}', 'as'];
      });
    }

    /**
     * ES6 Node
     *
     * Note: esprima doesn't follow the ESTree spec and `meta` & `property` are strings instead of Identifier nodes.
     *
     * @see https://github.com/estree/estree/blob/master/es6.md#metaproperty
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'MetaProperty',
    value: function MetaProperty() {
      return (0, _actualise2.default)(0, 0, '.', function (node) {
        return typeof node.meta === 'string' && typeof node.property === 'string' ? [node.meta, node.property] : undefined;
      });
    }

    /**
     * ES6 Node
     *
     * Note: must skip as the following FunctionExpression assigns the name.
     *
     * @see https://github.com/estree/estree/blob/master/es6.md#methoddefinition
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'MethodDefinition',
    value: function MethodDefinition() {
      return (0, _actualise2.default)(0, 0, function (node) {
        var operators = [];
        if (node.kind && (node.kind === 'get' || node.kind === 'set')) {
          operators.push(node.kind);
        }
        if (typeof node.static === 'boolean' && node.static) {
          operators.push('static');
        }
        return operators;
      }, undefined, 'key');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#objectpattern
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'ObjectPattern',
    value: function ObjectPattern() {
      return (0, _actualise2.default)(0, 0, '{}');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#restelement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'RestElement',
    value: function RestElement() {
      return (0, _actualise2.default)(0, 0, '... (rest)');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#spreadelement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'SpreadElement',
    value: function SpreadElement() {
      return (0, _actualise2.default)(0, 0, '... (spread)');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#super
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'Super',
    value: function Super() {
      return (0, _actualise2.default)(0, 0, undefined, 'super');
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#taggedtemplateexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'TaggedTemplateExpression',
    value: function TaggedTemplateExpression() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#templateelement
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'TemplateElement',
    value: function TemplateElement() {
      return (0, _actualise2.default)(0, 0, undefined, function (node) {
        return node.value.cooked !== '' ? node.value.cooked : undefined;
      });
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#templateliteral
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'TemplateLiteral',
    value: function TemplateLiteral() {
      return (0, _actualise2.default)(0, 0);
    }

    /**
     * ES6 Node
     * @see https://github.com/estree/estree/blob/master/es6.md#yieldexpression
     * @returns {{lloc: *, cyclomatic: *, operators: *, operands: *, ignoreKeys: *, newScope: *, dependencies: *}}
     */

  }, {
    key: 'YieldExpression',
    value: function YieldExpression() {
      return (0, _actualise2.default)(1, 0, 'yield');
    }
  }]);

  return PluginSyntaxESTree;
}(_AbstractSyntaxLoader3.default);

exports.default = PluginSyntaxESTree;
module.exports = exports['default'];