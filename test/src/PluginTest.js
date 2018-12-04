import { assert } from 'chai';
import fs         from 'fs';
import sortObj    from 'sort-object';
import ASTWalker  from 'typhonjs-ast-walker/src/ASTWalker';

import PluginSyntaxESTree  from '../../src/PluginSyntaxESTree';

const pluginData =
[
   { name: 'ESM', PluginClass: PluginSyntaxESTree }
];

pluginData.forEach((plugin) =>
{
   suite(`(${plugin.name}) plugin:`, () =>
   {
      suite('initialize:', () =>
      {
         const instance = new plugin.PluginClass();

         test('plugin was object', () =>
         {
            assert.isObject(instance);
         });

         test('plugin function is exported', () =>
         {
            assert.isFunction(instance.onLoadSyntax);
         });
      });

      suite('method invocation:', () =>
      {
         const instance = new plugin.PluginClass();

         test('plugin throws on empty event data', () =>
         {
            assert.throws(() => { instance.onConfigure(); });
         });

         test('plugin throws on empty event data', () =>
         {
            assert.throws(() => { instance.onLoadSyntax(); });
         });

         test('plugin passes back default settings data', () =>
         {
            const event = { data: { options: {}, settings: {}, syntaxes: {} } };
            instance.onConfigure(event);
            assert.strictEqual(event.data.settings.forin, false);
            assert.strictEqual(event.data.settings.logicalor, true);
            assert.strictEqual(event.data.settings.switchcase, true);
            assert.strictEqual(event.data.settings.trycatch, false);
         });

         test('plugin does not throw on proper event data', () =>
         {
            assert.doesNotThrow(() => { instance.onLoadSyntax({ data: { settings: {}, syntaxes: {} } }); });
         });

         test('plugin passes back syntax data', () =>
         {
            const event = { data: { settings: {}, syntaxes: {} } };
            instance.onLoadSyntax(event);
            assert.isObject(event.data.syntaxes);
         });

         test('plugin has correct syntax data length', () =>
         {
            const event = { data: { settings: {}, syntaxes: {} } };
            instance.onLoadSyntax(event);
            assert.strictEqual(Object.keys(event.data.syntaxes).length, 63);
         });

         test('plugin has correct syntax properties', () =>
         {
            const event = { data: { settings: {}, syntaxes: {} } };
            instance.onLoadSyntax(event);

            for (const type in event.data.syntaxes)
            {
               assert.strictEqual(JSON.stringify(Object.keys(event.data.syntaxes[type])),
                '["lloc","cyclomatic","operators","operands","ignoreKeys","newScope","dependencies"]');
            }
         });
      });

      suite('AST Walker:', () =>
      {
         const instance = new plugin.PluginClass();
         const verifyResult = JSON.stringify(JSON.parse(fs.readFileSync('./test/fixture/estree-results.json', 'utf8')));

         test('verify espree results', () =>
         {
            const results = {};
            const event = { data: { settings: {}, syntaxes: {} } };
            instance.onLoadSyntax(event);

            new ASTWalker().traverse(JSON.parse(fs.readFileSync('./test/fixture/espree-estree.json', 'utf8')),
            {
               enterNode: (node, parent) =>
               {
                  const syntax = event.data.syntaxes[node.type];

                  if (syntax !== null && typeof syntax === 'object')
                  {
                     if (typeof results[node.type] === 'undefined') { results[node.type] = {}; }

                     for (const metric in syntax)
                     {
                        if (typeof results[node.type][metric] === 'undefined') { results[node.type][metric] = {}; }

                        const value = syntax[metric].valueOf(node, parent);

                        const valueKey = JSON.stringify(value);

                        if (typeof results[node.type][metric][valueKey] === 'undefined')
                        {
                           results[node.type][metric][valueKey] = 1;
                        }
                        else
                        {
                           results[node.type][metric][valueKey]++;
                        }
                     }

                     return syntax.ignoreKeys.valueOf();
                  }
               }
            });

            assert.strictEqual(verifyResult, JSON.stringify(sortObj(results)));
         });
      });
   });
});