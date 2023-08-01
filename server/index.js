"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
var path = require("path");
const app = express();
const expressWs = require("express-ws")(app);
const { Vonage } = require("@vonage/server-sdk");
const cors = require("cors");
const fs = require("fs");
var isBuffer = require("is-buffer");
var header = require("waveheader");
var file;
const dataPath = "./contacts/userContacts.json";

const VONAGE_NUMBER = process.env.VONAGE_NUMBER;
const ANSWER_URL = process.env.ANSWER_WEBHOOK_URL;
const EVENT_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const vonage = new Vonage(
  {
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_PRIVATE_KEY_PATH,
  },
  { debug: true }
);

// initiate the call
async function makeCall(user) {
  let to = user.phone;
  return vonage.voice.createOutboundCall(
    {
      to: [{ type: "phone", number: to }],
      from: { type: "phone", number: VONAGE_NUMBER },
      answer_url: [ANSWER_URL],
      event_url: [EVENT_URL],
    },
    (err, response) => {
      if (err) {
        console.error("Error making outbound call:", err);
      } else {
        console.log("Outbound call response:", response);
      }
    }
  );
}

//Serve a Main Page
// app.get("/", function (req, res) {
//     res.send("Node Websocket");
// });

const saveAccountData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};
const getAccountData = () => {
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

const callStatuses = {};

app.get("/call-status", (req, res) => {
  const call_uuid = req.query.call_uuid;
  const status = callStatuses[call_uuid];
  res.status(200).send(status);
});

app.post("call", (req, res) => {
  // call the number
  // then save the call status
  // something like this:
  callStatuses[req.body.call_uuid] = {
    status: "ringing",
  };
});

app.get("/", (req, res) => {
  // let call_data = req.body.params;
  const call_data = [
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
    { name: "Evans Koech", phone: 254727143163, email: "biwottech@gmail.com", status: "" },
  ];

  call_data.map((call) => {
    console.log(call);
    var existAccounts = getAccountData();
    saveAccountData(existAccounts);
    let caller_uuid = makeCall(call);
    existAccounts[caller_uuid] = call;
    let status = existAccounts[caller_uuid].status;

    if (status == true) {
      // continue;
    } else {
      // break;
    }
  });
  return res.status(200).send("Message delivered");
});

const record_event_logs = (event) => {
  var existAccounts = getAccountData();
  fs.readFile(dataPath, "utf8", (err, data) => {
    const accountId = event.UUID;
    existAccounts[accountId] = {
      status: event.status,
    };
  });
};

app
  .get("/answer", (req, res) => {
    //Serve the NCCO on the /ncco answer URL
    // answer event
    let nccoResponse = [
      {
        action: "connect",
        from: "NexmoTest",
        endpoint: [
          {
            type: "websocket",
            uri: `wss://${req.hostname}/socket`,
            "content-type": "audio/l16;rate=16000",
          },
        ],
      },
    ];
    res.status(200).json(nccoResponse);
  })
  .ws("/socket", (ws, req) => {
    // Handle the Websocket
    var rawarray = [];
    console.log("Websocket Connected");
    ws.on("message", function (msg) {
      ws.send(msg); // returning the voice message directly to the user  // user can hear his/her voice
      if (isBuffer(msg)) {
        rawarray.push(msg);
      } else {
        console.log(msg);
      }
    });

    ws.on("close", function () {
      console.log("Websocket Closed");
      // record user conversation // end the call
      const audioFilePath = path.join(__dirname, "recordings", "output.wav");
      file = fs.createWriteStream(audioFilePath);
      file.write(
        header(((16000 * rawarray.length) / 50) * 2, {
          sampleRate: 16000,
          channels: 1,
          bitDepth: 16,
        })
      );
      rawarray.forEach(function (data) {
        file.write(data);
      });
    });
  });

//Log the Events
app.post("/event", function (req, res) {
  let status = req.body.status;
  let conversation_uuid = req.body.conversation_uuid;
  switch (status) {
    case "ringing":
      record_event_logs({ UUID: conversation_uuid, status: "ringing" });
      callStatuses[conversation_uuid] = {
        status: "ringing",
      };
      break;
    case "answered":
      record_event_logs({ UUID: conversation_uuid, status: "answered" });
      callStatuses[conversation_uuid] = {
        status: "answered",
      };
      break;
    case "complete":
      record_event_logs({ UUID: conversation_uuid, status: "complete" });
      callStatuses[conversation_uuid] = {
        status: "complete",
      };
      break;
    case "canceled":
      record_event_logs({ UUID: conversation_uuid, status: "canceled" });
      callStatuses[conversation_uuid] = {
        status: "canceled",
      };
      break;
    default:
      break;
  }
  return res.status(204).send("");
});

// websocket connection
expressWs.getWss().on("connection", function (ws) {
  console.log("Websocket connection is open");
  // console.log(ws);
});

app.listen(PORT, () => console.log(`Listening on port http://localhost:${PORT}`));
