const express = require('express');
const {Interaction, validateInteraction} = require('slashy');
const {promisify} = require('util');

const app = express();
const wait = promisify(setTimeout);

app.use(express.json());

app.post(
  '/cmds',
  validateInteraction(process.env.PUBLIC_KEY),
  async (req, res) => {
    const i = new Interaction(req.body, process.env.APPLICATION_ID);

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

    return res.sendStatus(200);
  }
);

app.listen(8080, () => console.log('Listening on port 8080'));
