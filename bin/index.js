#! /usr/bin/env node
var shell = require("shelljs");

const { CLIEngine } = require("eslint");
const { appendFile, readFile, writeFile } = require("fs");

shell.exec("echo Processing your files ...");

const log = err => {
  if (err) {
    throw err;
  }
};

const getEslintWarningAndErrorReport = () => {
  const args = process.argv.slice(2);
  const cli = new CLIEngine({
    // configFile: eslintConfigPath,
    envs: ["browser", "mocha"]
    //   useEslintrc: false,
  });

  shell.exec("echo Getting a report for bad rules...");
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

const disableESLintIssues = results => {
  const ruleIds = new Set();
  const readFilePromises = results.map(result => {
    const { messages, filePath } = result;
    const lineMeta = [];

    // Parse failing rules
    messages.forEach(message => {
      const { line, ruleId } = message;

      // TODO: Handle multiple failing rules per line
      lineMeta.push({
        ruleId,
        lineNumber: line
      });
    });

    return new Promise(resolve => {
      readFile(filePath, (err, data) => {
        log(err);

        const fileContentsArr = data.toString().split("\n");
        let linePadding = 0;
        // `lineMeta` has the line numbers to disable eslint rules.
        lineMeta.forEach(({ ruleId, lineNumber }) => {
          // TODO: Handle JSX comments
          fileContentsArr.splice(
            lineNumber - 1 + linePadding,
            0,
            `// eslint-disable-next-line ${ruleId}`
          );
          linePadding++; // increment linePadding since every insertion increases lineNumber by 1
          ruleIds.add(ruleId);
        });
        const text = fileContentsArr.join("\n");
        writeFile(filePath, text, log);
        resolve(ruleIds);
      });
    });
  });
  return readFilePromises;
};

const transformEslintWarnings = () => {
  const { results: resultsArr } = getEslintWarningAndErrorReport();
  shell.exec("echo Disabling ESLint issues...");
  const promises = disableESLintIssues(resultsArr);
  shell.exec("echo Writing modified rules to file...");
  Promise.all(promises).then(ruleIdsArr => {
    writeModifiedRules(ruleIdsArr);
  });
  shell.exec("echo Done");
};

transformEslintWarnings();
