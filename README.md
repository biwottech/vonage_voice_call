



# Web-based Phone Calling System using Vonage

This is the the [Vonage Video API (formerly TokBox OpenTok)](https://developer.vonage.com/en/voice/voice-api/overview) using websockets to connect users to the AI endpoint.The Vonage Voice API allows you to connect people around the world and automate voice interactions that deliver a frictionless extension of your brand experience using AI technologies.

We will not be using any front-end and Back-end frameworks for this project, Reactjs for the front-end and Express js and node for the backend, and Websockets for communications with Vonage Voice API.

## Running on your local machine

1. `git clone https://github.com/UPWANI/vonage_video_call.git`
2. `cd client`
3. `npm install`
4. `cd server`
5. `npm install`
6. `node server.js`
6. `ngrok 5000`
7. `Configure .env file in server folder with your credentials`

## .env configurations
1. `TO_NUMBER=`
2. `VONAGE_NUMBER=`
3. `WEBHOOK_URL='http://example.com//event'`
4. `ANSWER_WEBHOOK_URL='http://example.com/answer'`
5. `RECORD_WEBHOOK_URL='http://example.com/record'`
6. `OUTPUT_WEBHOOK_URL='http://example.com/input'`
7. `TRANSCRIPTION_WEBHOOK_URL='http://example.com/transcription'`
8. `WEBSOCKET_URL='ws://http://example.com/socket'`
9. `VONAGE_API_KEY=`
10. `VONAGE_API_SECRET=`
11. `VONAGE_APPLICATION_ID=`
12. `VONAGE_PRIVATE_KEY_PATH=`
13. `PORT=3000`

## Guidelines for creating account and application
1) You can create Voice applications in the Dashboard.

2) To create your application using the Dashboard:

3) Under Applications in the Dashboard, click the Create a new application button.

4) Under Name, enter the Application name. Choose a name for ease of future reference.

5) Click the button Generate public and private key. This will create a public/private key pair and the private key will be downloaded by your browser. Save the private key that was generated.

6) Under Capabilities select the Voice button.

7) In the Answer URL box, enter the URL for your inbound calls webhook, for example, http://example.com/webhooks/answer.

8) In the Event URL box, enter the URL for your call status webhook, for example, http://example.com/webhooks/events.

9) Click the Generate new application button.

10) You are now taken to the next step of the Create Application procedure where you should link your Vonage number to the application.

11) You have now created your application.

## Code of Conduct

## Contributing

## License

This project is subject to the [MIT License][license]


[coc]: CODE_OF_CONDUCT.md "Code of Conduct"
[license]: LICENSE "MIT License"# vonage_voice_call
