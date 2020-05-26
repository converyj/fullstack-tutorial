// Run Apollo Server with schema

const { ApolloServer } = require("apollo-server"); // Apollo Server
const typeDefs = require("./schema.js"); // schema
const { createStore } = require("./utils");
const resolvers = require("./resolvers"); // resolvers

const LaunchAPI = require("./datasources/launch"); // datasource
const UserAPI = require("./datasources/user"); // datasource

const isEmail = require("isemail"); // validate email package

const store = createStore();

const server = new ApolloServer({
	/* Mutation.login resolver returns a token that clients can use to authenticate themselves to our server.Now, we need to add logic to our server to actually perform the authentication.
	*/
	context: async ({ req }) => {
		// simple auth check on every request
		const auth = (req.headers && req.headers.authorization) || "";
		const email = Buffer.from(auth, "base64").toString("ascii");
		if (!isEmail.validate(email)) return { user: null };
		// find a user by their email
		const users = await store.users.findOrCreate({ where: { email } });
		const user = (users && users[0]) || null;
		return { user: { ...user.dataValues } };
	},
	typeDefs,
	resolvers,
	dataSources: () => ({
		launchAPI: new LaunchAPI(),
		userAPI: new UserAPI({ store })
	})
}); // Apollo Server Instance

// Run Server
server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
