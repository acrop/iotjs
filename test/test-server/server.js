/* Copyright 2019-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const https = require('https');
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const app = express();

const wss = new WebSocket.Server({port: 80});

const key_path = process.argv[2] || '/root/work_space/iotjs/test/resources/my_key.key'
const cert_path = process.argv[3] || '/root/work_space/iotjs/test/resources/my_crt.crt'

const options = {
  key:  fs.readFileSync(key_path),
  cert: fs.readFileSync(cert_path)
};

const contentType = {'Content-Type': 'application/json'};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    ws.send(message);
  });
  ws.on('error', (err) => {
    console.log(err);
    ws.close();
  })
});

var httpsServer = https.createServer(options, app);
httpsServer.listen(443);

app.get('/user-agent', function (req, res) {
  var user_agent = req.headers['user-agent'];
  res.writeHead(200, contentType);
  res.end(JSON.stringify({'user-agent': user_agent}));
});

app.get('/get', function (req, res) {
  var header = req.headers;
  res.writeHead(200, contentType);
  res.end(JSON.stringify(header));
});

app.get('/delay/:delay', function (req, res) {
  var header = req.headers;
  var delay = Math.max(req.params.delay*1000, 10000);
  setTimeout (function () {
    res.writeHead(200, contentType);
    res.end(JSON.stringify(header));
  }, delay);
});

app.post('/post', function (req, res) {
  req.on('data', function (data){
    data = data.toString();
    res.writeHead(200, contentType);
    res.end(JSON.stringify({'data': data}));
  });
});
