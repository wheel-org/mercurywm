/* @flow */

let script: {
  output: string => void,
  writeFile: (string, string) => void,
  exec: string => void
};

let resolve: any => void;

function getData(url) {
  const xml = new XMLHttpRequest();
  xml.open('GET', url, false);
  xml.send(null);
  if (xml.status == 200) return xml.responseText;
  return '';
}

function createMan(command, desc, usage) {
  script.output('Creating manpage for ' + command);
  let s = '## ' + command;
  if (desc.length > 0) {
    s += '\n\n' + desc;
  }
  if (usage.length > 0) {
    s += '\n\nUsage: ' + usage.reduce((acc, val) => acc + '\n\n' + val);
  }
  script.writeFile('~/.man/' + command, s);
}

function setupFile() {
  script.output('Setting up man directory...');
  script.output('====================================');
  script.exec('cd');
  script.exec('mkdir .man');
  script.output('====================================');
  script.output('\n');

  script.output('Retrieving latest Mercury Module Manager (mmm)...');
  script.output('====================================');
  const mmmUrl = 'http://127.0.0.1:8080/modules/mmm/';
  const version = getData(mmmUrl + 'VERSION');
  const code = getData(mmmUrl + version + '/main.js');
  // $FlowFixMe: "Function" isn't callable
  Function('script', 'args', 'resolve', code)(
    Object.assign({}, script, { output: () => {} }),
    ['install', 'mmm', () => {}]
  );
  script.output('Installed mmm@' + version);
  script.output('====================================');
  script.output('\n');

  script.output('Installing man...');
  script.output('====================================');
  script.exec('mmm install man');
  // install automatically makes the =========== border
  script.output('\n');

  script.output('Creating system man pages...');
  script.output('====================================');
  script.exec('cd .man');
  createMan('reset', 'Resets MercuryWM, will destroy all user files!', []);
  createMan('clear', 'Clears the current terminal output.', []);
  createMan('env', "Set's environment variables.", [
    'env - Lists all environment variables',
    "env [var] - Output's variable value",
    "env [var] [value] - Set's variable value"
  ]);
  createMan(
    'window',
    'Manipulates windows on the screen. Window id is the first number (not in parentheses) at the bottom of the window in the black bar.',
    [
      'window vs - Splits current window in half vertically',
      'window hs - Splits current window in half horizontally',
      'window merge [id] - Merge current window with the window given; windows must share a same-length common edge',
      'window merge [id1] [id2] - Merges the two windows given; windows must share a same-length common edge',
      "window [left | right | top | bottom] [value] - Moves window's given edge by given value; windows must share a same-length common edge",
      'window list - Lists all the windows in the current workspace'
    ]
  );
  createMan('workspace', 'Manipulates workspaces in the environment.', [
    'workspace add - Adds a workspace',
    'workspace remove [index] - Removes given workspace (will reset current workspace to 0)'
  ]);
  createMan('cd', 'Changes current working directory.', [
    'cd - Goes to root (~) directory',
    'cd [path] - Navigates to given relative path'
  ]);
  createMan('ls', '', [
    'ls - Lists files and directories in current working directory',
    'ls -a - Also shows hidden files and directories'
  ]);
  createMan('mkdir', '', [
    'mkdir [name] - Creates a directory in current working directory'
  ]);
  createMan('cat', '', [
    'cat [name] - Outputs the file contents to the screen'
  ]);
  createMan('edit', '', [
    'edit [name] - Simple editor to edit contents of a file'
  ]);
  createMan('yum', 'Network downloader', [
    "yum - Outputs 'spaghetti sauce'",
    'yum [url] [file] - Downloads a file and writes the contents to a local file'
  ]);
  createMan('rm', '', [
    'rm [file] - Removes file or directory',
    'rm -f [file] - Removes file',
    'rm -d [file] - Removes directory'
  ]);
  script.exec('cd ..');
  script.output('====================================');
  script.output('\n');
  script.output('Setup has successfully completed.');
  resolve();
}

export default getData.toString() +
  createMan.toString() +
  '(' +
  setupFile.toString() +
  ')()';
