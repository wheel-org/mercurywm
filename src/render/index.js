/* @flow strict */

import type { ExtensionMessage, ExtensionResponse } from "types";

const fileRequestCallback: { [string]: (string) => void } = {};
const qp: { [string]: string } = getQueryParams(document.location.search);
const { runningCommand, workingDirectory, cache, id } = qp;
const env: { [string]: string } = JSON.parse(qp.env);
const params: string[] = JSON.parse(qp.params);

console.log({ runningCommand, workingDirectory, cache, id, env, params });

function getFile(path: string, callback: string => void) {
  const absolutePath = path.startsWith("~")
    ? path
    : workingDirectory + "/" + path;
  fileRequestCallback[absolutePath] = callback;
  sendMessage({
    type: "requestFile",
    path: absolutePath
  });
}
window.getFile = getFile;

function writeFile(path: string, content: string) {
  sendMessage({
    type: "writeFile",
    path,
    content
  });
}
window.writeFile = writeFile;

function getEnv(key: string) {
  return env[key] || "";
}
window.getEnv = getEnv;

function setEnv(key: string, value: string) {
  env[key] = value;
  sendMessage({
    type: "env",
    key,
    value
  });
}
window.setEnv = setEnv;

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

const content = document.getElementById("content");
const head = document.head;
if (content) {
  let jsToEval = []
  let calls = 0;
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    calls += 1;
    getFile(param, file => {
      if (param.endsWith('.html')) {
        content.innerHTML = file;
      }
      else if (param.endsWith('.js')) {
        jsToEval[i] = file;
      }
      else if (param.endsWith('.css')) {
        const style = document.createElement('style');
        if (head) {
          style.type = 'text/css';
          style.appendChild(document.createTextNode(file));
          head.appendChild(style);
        }
      }
      calls -= 1;
      if (calls <= 0) {
        (function() {
          window.eval(Object.values(jsToEval).join('\n\n'));
        })();
      }
    });
  }
}
