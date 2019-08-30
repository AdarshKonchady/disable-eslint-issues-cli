#! /usr/bin/env node

const { CLIEngine } = require("eslint");
const { appendFile, readFile, writeFile } = require("fs");
const yargs = require('yargs');

const { argv } = yargs
  .usage('$0 [options] <paths>')
  .scriptName('disable-eslint-issues-cli')
  .option('include-fixable', {
    alias: 'f',
    describe: 'Also disable auto-fixable ESLint rules.',
    type: 'boolean'
  });

console.log("Processing your files...");

console.log('adarsh');
const log = err => {
  if (err) {
    throw err;
  }
};

const addDisableCommentsToFileContents = (lineMeta, data) => {
  const ruleIds = new Set();
  const fileContentsArr = data.toString().split("\n");
  let linePadding = 0;
  // `lineMeta` has the line numbers to disable eslint rules.
  Object.entries(lineMeta).forEach(ruleMeta => {
    const [lineNumber, ruleIdsPerLine] = ruleMeta;
    const prevLine = fileContentsArr[lineNumber - 2];
    const prevMatch =
      prevLine &&
      prevLine.match(/\s*\/\/\s*eslint-disable-next-line\s+(.*)\s*/);
    const lineIndex = lineNumber - 1 + linePadding;

    if (prevMatch) {
      fileContentsArr.splice(
        lineIndex - 1,
        1,
        `// eslint-disable-next-line ${prevMatch[1]}, ${ruleIdsPerLine.join(
          ", "
        )}`
      );
    } else {
      fileContentsArr.splice(
        lineIndex,
        0,
        `// eslint-disable-next-line ${ruleIdsPerLine.join(", ")}`
      );
      linePadding++; // increment linePadding since every insertion increases lineNumber by 1
    }

    ruleIdsPerLine.forEach(ruleId => {
      ruleIds.add(ruleId);
    });
  });

  const text = fileContentsArr.join("\n");

  return {
    ruleIds,
    text
  };
};

const getEslintWarningAndErrorReport = () => {
  const args = argv._;
  const cli = new CLIEngine({
    // configFile: eslintConfigPath,
    envs: ["browser", "mocha"]
    //   useEslintrc: false,
  });

  console.log("Getting a report for bad rules...");

  const report = cli.executeOnFiles(args);

  return report;
};

const writeModifiedRules = ruleIdsArr => {
  const uniqueRuleIds = new Set();
  ruleIdsArr.forEach(ruleSet => {
    Array.from(ruleSet).forEach(ruleSetElement => {
      uniqueRuleIds.add(ruleSetElement);
    });
  });
  const ruleSetText = Array.from(uniqueRuleIds).join("\n");
  appendFile("./modifiedRuleIds.txt", ruleSetText, log);
};

/**
 * @param {array} results - Array of files with ESLint report for each file
 */
const disableESLintIssues = results => {
  const { includeFixable } = argv;

  const readFilePromises = results.map(result => {
    const { messages, filePath } = result;
    const lineMeta = {};

    // Parse failing rules for each file
    messages.forEach(message => {
      const { line, ruleId, fix } = message;

      if (fix && !includeFixable) return;

      // Create a map of failing rules per line
      if (lineMeta[line]) {
        lineMeta[line].push(ruleId);
      } else {
        lineMeta[line] = [ruleId];
      }
    });

    return new Promise(resolve => {
      readFile(filePath, (err, data) => {
        if (err) {
          log(err);
          return;
        }

        const { text, ruleIds } = addDisableCommentsToFileContents(
          lineMeta,
          data
        );

        writeFile(filePath, text, log);

        resolve(ruleIds);
      });
    });
  });
  return readFilePromises;
};

const transformEslintWarnings = () => {
  const { results: resultsArr } = getEslintWarningAndErrorReport();

  console.log("Disabling ESLint issues...");

  const promises = disableESLintIssues(resultsArr);

  console.log("Writing modified rules to file...");

  Promise.all(promises).then(ruleIdsArr => {
    writeModifiedRules(ruleIdsArr);
  });

  console.log("Done");
};

transformEslintWarnings();

exports.addDisableCommentsToFileContents = addDisableCommentsToFileContents;
