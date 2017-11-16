export default `
function getData(url) {
    var xml = new XMLHttpRequest();
    xml.open("GET", url, false);
    xml.send(null);
    if (xml.status == 200) return xml.responseText;
    return "";
}
function createMan(command, desc, usage) {
    script.output("Creating manpage for " + command);
    var s = "## " + command;
    if (desc.length > 0) {
        s += "\\n\\n" + desc;
    }
    if (usage.length > 0) {
        s += "\\n\\nUsage: ";
        for (var i = 0; i < usage.length; i++) {
            if (i != 0) s += "\\n\\n";
            s += usage[i];
        }
    }
    script.writeFile("~/.man/" + command, s);
}
script.output("Setting up MercuryWM");
script.exec("mkdir .man");
script.output("Retrieving latest mmm package manager...");
var mmmUrl = "https://raw.githubusercontent.com/wheel-org/mercurywm-scripts/master/modules/mmm/";
var version = getData(mmmUrl + "VERSION");
var code = getData(mmmUrl + version + "/main.js");
Function("script", "args", code)({ ...script, output: ()=>{} }, ['install', 'mmm']);
script.output("Installed mmm@" + version);
script.exec("mmm install man");
script.output("mmm and man installed, grabbing system man pages");
script.exec("cd .man");
createMan("reset", "Resets MercuryWM, will destroy all user files!", []);
createMan("clear", "Clears the current terminal output.", []);
createMan("env", "Set's environment variables.", [
    "env - Lists all environment variables",
    "env [var] - Output's variable value",
    "env [var] [value] - Set's variable value"
]);
createMan("window", "Manipulates windows on the screen. Window id is the first number (not in parentheses) at the bottom of the window in the black bar.", [
    "window vs - Splits current window in half vertically",
    "window hs - Splits current window in half horizontally",
    "window merge [id] - Merge current window with the window given; windows must share a same-length common edge",
    "window merge [id1] [id2] - Merges the two windows given; windows must share a same-length common edge",
    "window [left | right | top | bottom] [value] - Moves window's given edge by given value; windows must share a same-length common edge"
]);
createMan("workspace", "Manipulates workspaces in the environment.", [
    "workspace add - Adds a workspace",
    "workspace remove [index] - Removes given workspace (will reset current workspace to 0)"
]);
createMan("cd", "Changes current working directory.", [
    "cd - Goes to root (~) directory",
    "cd [path] - Navigates to given relative path"
]);
createMan("ls", "", [
    "ls - Lists files and directories in current working directory",
    "ls -a - Also shows hidden files and directories"
]);
createMan("mkdir", "", [
    "mkdir [name] - Creates a directory in current working directory"
]);
createMan("cat", "", [
    "cat [name] - Outputs the file contents to the screen"
]);
createMan("edit", "", [
    "edit [name] - Simple editor to edit contents of a file"
]);
createMan("yum", "Network downloader", [
    "yum - Outputs 'spaghetti sauce'",
    "yum [url] [file] - Downloads a file and writes the contents to a local file"
]);
createMan("rm", "", [
    "rm [file] - Removes file or directory",
    "rm -f [file] - Removes file",
    "rm -d [file] - Removes directory",
]);
script.exec("cd ..");
`;