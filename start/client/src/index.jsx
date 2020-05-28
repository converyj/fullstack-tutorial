import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import Login from "./pages/login";
import injectStyles from "./styles";
import { typeDefs, resolvers } from "./resolvers";

const cache = new InMemoryCache();
/* Specifying the headers option on HttpLink allows us to read the token from localStorage
and attach it to the request's headers each time a GraphQL operation is made 
*/
const link = new HttpLink({
	headers: { authentorization: localStorage.getItem("token") },
	uri: "http://localhost:4000/"
});

// the instantiation of the client object.
const client = new ApolloClient({
	cache,
	link,
	typeDefs,
	resolvers
});

// cache the current state
cache.writeData({
	data: {
		isLoggedIn: !!localStorage.getItem("token"),
		cartItems: []
	}
});

const IS_LOGGED_IN = gql`
	query isUserLoggedIn {
		isLoggedIn @client
	}
`;

function IsLoggedIn() {
	const { data } = useQuery(IS_LOGGED_IN);
	return data.isLoggedIn ? <Pages /> : <Login />;
}

injectStyles();
ReactDOM.render(
	<ApolloProvider client={client}>
		<Pages />
	</ApolloProvider>,
	document.getElementById("root")
);
