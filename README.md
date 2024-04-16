# okta-mfa-oob-express-sample

This is a node/express example of Okta Direct Authentication (MFA OOB) flow. Please refer to [Okta developer documentation](https://developer.okta.com/docs/guides/configure-direct-auth-grants/dmfaoobov/main/) to learn more about this flow.

한국 고객을 위한 가이드 문서는 Okta Korea 영업팀에 문의해주시기 바랍니다.

## How to Install

You need to have Node.js in your machine. You can download one that fits your environment [here](https://nodejs.org/en/download). Once you have Node.js installed, you can clone or just download this repo as a `.ZIP` file and extract.

Open up your command or terminal window, move to the root folder of the project (where you find this `README.md` file) and enter the below to install dependencies.

```
npm install
```

Once this is done, revise `oktaConfig.js` with your own Okta tenant and client ID.

## How to Run the Project

Below command will run the server at localhost:3005. Nodemon will detect code change and re-run the server when you save your code change.

```
npm run dev
```
