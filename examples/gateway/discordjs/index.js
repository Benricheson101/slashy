const {Client} = require('discord.js');
const {Interaction} = require('slashy');
const {promisify} = require('util');

const client = new Client();
const wait = promisify(setTimeout);

client.ws.on('INTERACTION_CREATE', async interaction => {
  const i = new Interaction(interaction, client.user.id);

  switch (i.data.name) {
    case 'ping': {
      const before = Date.now();

      await i.send({
        type: 3,
        data: {
          content: ':ping_pong: Pong!',
        },
      });

      const after = Date.now();

      await i.edit(`:stopwatch: Message sent in ${after - before}ms`);
      await wait(5000);
      await i.delete();

      break;
    }
  }
});

client.on('ready', () => console.log('Ready!'));

client.login();
