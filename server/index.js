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
  var response;
  try {
    response = await vonage.voice.createOutboundCall(
      {
        to: [{ type: "phone", number: to }],
        from: { type: "phone", number: VONAGE_NUMBER },
        answer_url: [ANSWER_URL],
        event_url: [EVENT_URL],
      },
      (err, response) => {
        console.log(response);
        if (err) {
          console.error("Error making outbound call:", err);
        } else {
          console.log("Outbound call response:", response);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }

  return response;
}

//Serve a Main Page
app.get("/", function (req, res) {
  res.send("Node Websocket");
});

app.post("/call-status", async (req, res) => {
  const call_uuid = req.body.call;
  const response = await vonage.voice.getCall(call_uuid)
    .then((resp) => {
      console.log(resp)
      return res.status(200).json({ response: resp, status:200 });
    })
    .catch((err) => {
      return res.status(201).json({ response: err, status:201 });
    });

    // return res.status(200).json({});
});

app.post("/call", async (req, res) => {
  let call_data = req.params;
  var response = await makeCall({ name: 'Evans Koech', phone: 254727143163, email: 'biwottech@gmail.com' }); // replace call data here
  return res.status(200).json({ call: response, message: 'call_instantiated' });
});


const record_event_logs = (event) => {
  // console.log(event)
};

app
  .get("/answer", (req, res) => {
    //Serve the NCCO on the /ncco answer URL
    // answer event
    let nccoResponse = [
      {
        "action": "stream",
        "streamUrl": [
            "http://914288e7.ngrok.io/audio/silence.mp3"
        ]
    },
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
    // console.log("Websocket Connected");
    ws.on("message", function (msg) {
      ws.send(msg); // returning the voice message directly to the user  // user can hear his/her voice
      if (isBuffer(msg)) {
        rawarray.push(msg);
      } else {
        // console.log(msg);
      }
    });
    ws.on("close", function () {
      // console.log("Websocket Closed");
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
      break;
    case "answered":
      record_event_logs({ UUID: conversation_uuid, status: "answered" });
      break;
    case "complete":
      record_event_logs({ UUID: conversation_uuid, status: "complete" });
      break;
    case "canceled":
      record_event_logs({ UUID: conversation_uuid, status: "canceled" });
      break;
    default:
      break;
  }
  return res.status(204).send("");
});

// websocket connection
expressWs.getWss().on("connection", function (ws) {
  // console.log("Websocket connection is open");
  // console.log(ws);
});

app.listen(PORT, () => console.log(`Listening on port http://localhost:${PORT}`));
