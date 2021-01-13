<h1 align="center">Slashy <img align="center" height="42" width="42" src="https://i.red-panda.red/slash_command.svg"></h1>

Slashy is an easy  to use framework for [Discord slash commands](https://discord.com/developers/docs/interactions/slash-commands). It works with both interactions received over the gateway and via webhook, and even includes middleware to handle webhook validation with ease.

## Installation
1. Install
```bash
npm i slashy
# or
yarn add slashy
```
2. Import
```js
const {Interaction, validateInteraction, validateRequest} = require('slashy');
import {Interaction, validateInteraction, validateRequest} from 'slashy';
```

## Methods
The following methods can be called on an instance of the Interaction class (defined `i` in the above examples)

#### constructor
The constructor only has one required parameter, `interaction`, containing interaction data. If you choose to exclude all other parameters, you must set your application ID as an environment variable called `APPLICATION_ID` and the default send options will be used.
- `new Interaction(interaction: Interaction)`
- `new Interaction(interaction: Interaction, defaults?: Partial<InteractionResponse>)`
- `new Interaction(interaction: Interaction, applicationId?: string, defaults?: Partial<InteractionResponse>)`

Example:
```js
const i = new Interaction(interaction, 'application-id', {
  type: 3 // send initial response as `ChannelMessage` by default
});
```

#### send
- `i.send(body: string): Promise<void | WebhookPostResult>` - send a plain text message
- `i.send(body: InteractionResponse): Promise<void>` - send the initial response message. Note: no data is returned
- `i.send(body: WebhookBody): Promise<WebhookPostResult>` - send a followup message

#### edit
> Exclude the `id` parameter to edit the initial response.

- `i.edit(body: string, id?: string): Promise<WebhookPostResult>` - edit the message's text content
- `i.edit(body: WebhookBody, id?: string): Promise<WebhookPostResult>` - edit the full message object

#### delete
> Exclude the `id` parameter to delete the initial response.

- `i.delete(): Promise<void>` - delete the initial response
- `i.delete(id: string)` - delete a followup message

#### toString
- `i.toString(): string` - generate the command that was typed by the user using the data provided

#### content (getter)
Alias for [`Interaction#toString`](#toString)

#### callbackURL (getter)
- `i.callbackURL: string` - the callback URL (used for sending the initial response)

#### webhookURL (getter)
- `i.webhookURL: string` - the webhook URL (used for sending followup messages)

## Types
Slashy comes with all documented interaction types from [Discord's API docs](https://discord.com/developers/docs/interactions/slash-commands).

## Usage
Slash supports both methods of receiving Discord interaction data.

For more examples, refer to the [examples folder](/examples)

### Gateway
If you are using a bot, receiving interactions over the Discord gateway is the simplest option. Most Discord libraries have a way to listen for raw websocket events, so we'll use that to listen for `INTERACTION_CREATE` events.

#### Discord.js
```js
bot.ws.on('INTERACTION_CREATE', interaction => {
  const i = new Interaction(interaction, bot.user.id);
});
```

#### Eris
```js
bot.on('rawWS', event => {
  if (event.t === 'INTERACTION_CREATE') {
    const i = new Interaction(event.d, bot.user.id);
  }
});
```

### Webhook
If you are not using a bot or prefer to receive interactions via webhook, theres a few additional steps you must take. Out of the box, slashy includes Express middleware to handle webhook validation as well as a validation function that makes it easy to use with any webserver.

#### Express
```js
app.use(express.json());

app.post('/cmds', validateInteraction('public-key'), (req, res) => {
  const i = new Interaction(req.body, 'application-id');
});
```

#### Other Webservers
Not everyone uses express, there's some other great options out there. Slash comes with a validation function that makes verifying requests easy, no matter which framework you're using. In the example below, I will be using Fastify, but it should be pretty easy to use with whatever framework you're using.

```js
fastify.post('/cmds', async (request, reply) => {
  const isSigned = await validateRequest(
    'public-key',
    request.body,
    request.headers
  );

  // request is not valid
  if (!isSigned) {
    return reply.code(401);
  }

  // acknowledge ping
  if (request.body.type === 1) {
    return {type: 1};
  }

  const i = new Interaction(request.body, 'application-id');
});
```
