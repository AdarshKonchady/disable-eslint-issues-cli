const { addDisableCommentsToFileContents } = require('../bin');

describe('addDisableCommentsToFileContents', () => {
  test('noop', () => {
    const lineMeta = {};
    const result = addDisableCommentsToFileContents(lineMeta, `
      const a = 1;
    `);
    expect(result.text).toBe(`
      const a = 1;
    `);
  });

  test('disables one', () => {
    const lineMeta = {
      2: ['test-rule']
    };
    const result = addDisableCommentsToFileContents(lineMeta, `
      const a = 1;
    `);
    expect(result.text).toBe(`
// eslint-disable-next-line test-rule
      const a = 1;
    `);
  });

  test('disables with existing', () => {
    const lineMeta = {
      2: ['test-rule']
    };
    const result = addDisableCommentsToFileContents(lineMeta, `// eslint-disable-next-line existing-rule, other-existing-rule
      const a = 1;
    `);
    expect(result.text).toBe(`// eslint-disable-next-line existing-rule, other-existing-rule, test-rule
      const a = 1;
    `);
  });
});
