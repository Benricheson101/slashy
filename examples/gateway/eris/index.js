const Eris = require('eris');
const {Interaction} = require('slashy');
const {promisify} = require('util');

const bot = new Eris(process.env.DISCORD_TOKEN);
const wait = promisify(setTimeout);

bot.on('rawWS', async event => {
  switch (event.t) {
    case 'INTERACTION_CREATE': {
      const i = new Interaction(event.d, bot.user.id);

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
      break;
    }
  }
});

bot.on('ready', () => console.log('Ready!'));

bot.connect();
