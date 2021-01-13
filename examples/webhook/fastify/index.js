const fastify = require('fastify')();
const {Interaction, validateRequest} = require('slashy');
const {promisify} = require('util');

const wait = promisify(setTimeout);

fastify.post('/cmds', async (request, reply) => {
  const isSigned = await validateRequest(
    process.env.PUBLIC_KEY,
    request.body,
    request.headers
  );

  if (!isSigned) {
    return reply.code(401);
  }

  const i = new Interaction(request.body, process.env.APPLICATION_ID);

  if (i.type === 1) {
    return {type: 1};
  }

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

fastify.listen(8080, (err, addr) => {
  if (err) {
    console.error(err);
    throw err;
  }

  console.log('Listening on:', addr);
});
