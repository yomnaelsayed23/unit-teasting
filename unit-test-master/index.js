// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const startDB = require("./helpers/DB");
const userRoutes = require("./routes/user");
const { addUser, getUsers } = require("./controllers/user.js");
fastify.register(startDB);
// Declare a route
// fastify.get('/', function handler (request, reply) {
//   reply.send({ hello: 'world' })
// })
userRoutes.forEach((route) => {
  fastify.route(route);
});

// let app = fastify();

// app.get("/api/users", getUsers);

// Run the server!
fastify.listen({ port: 3002 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
