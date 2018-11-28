/* @flow strict */

import type { ExtensionMessage, ExtensionResponse } from "types";

const fileRequestCallback: { [string]: (string) => void } = {};
const qp: { [string]: string } = getQueryParams(document.location.search);
const { runningCommand, workingDirectory, cache, id } = qp;
const env: { [string]: string } = JSON.parse(qp.env);
const params: string[] = JSON.parse(qp.params);
console.log({ runningCommand, workingDirectory, cache, id, env, params });

const content = document.getElementById("content");
if (content && params[0]) {
  getFile(params[0], htmlFile => {
    console.log(htmlFile);
    content.innerHTML = htmlFile;
    if (params[1]) {
      getFile(params[1], jsFile => {
        console.log(jsFile);
        (function() {
          eval(jsFile);
        })();
      });
    }
  });
}

function getFile(path: string, callback: string => void) {
  const absolutePath = path.startsWith("~")
    ? workingDirectory + "/" + path
    : path;
  fileRequestCallback[absolutePath] = callback;
  sendMessage({
    type: "requestFile",
    path: absolutePath
  });
}

function writeFile(path: string, content: string) {
  sendMessage({
    type: "writeFile",
    path,
    content
  });
}

function getEnv(key: string) {
  return env[key] || "";
}

function setEnv(key: string, value: string) {
  env[key] = value;
  sendMessage({
    type: "env",
    key,
    value
  });
}

// Exit render
function done() {
  sendMessage({
    type: "done",
    id
  });
}

function sendMessage(msg: ExtensionMessage) {
  parent.postMessage(JSON.stringify(msg), "*");
}

window.onload = function() {
  window.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.keyCode === 67) {
      // Quit extension on Ctrl+C
      done();
    }
  });

  window.addEventListener("message", event => {
    const message: ExtensionResponse = JSON.parse(event.data);
    if (message.type === "file") {
      if (fileRequestCallback[message.path]) {
        fileRequestCallback[message.path](message.contents);
        delete fileRequestCallback[message.path];
      }
    }
  });

  const textareas = document.getElementsByTagName("textarea");
  for (let t of textareas) {
    t.onkeydown = e => {
      if (e.keyCode === 9 || e.which === 9) {
        // Output tab character instead of switching focus
        e.preventDefault();
        const s = this.selectionStart;
        this.value =
          this.value.slice(0, this.selectionStart) +
          "\t" +
          this.value.slice(this.selectionEnd);
        this.selectionEnd = s + 1;
      }
    };
  }
};

// Parse URL query parameters
function getQueryParams(qs) {
  const query = qs.split("+").join(" "),
    params = {},
    re = /[?&]?([^=]+)=([^&]*)/g;
  let tokens;

  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

// Capture click event to tell Mercury this window is selected
document.addEventListener('click', () => {
  sendMessage({
    type: 'selectWindow',
    id
  });
}, true);
