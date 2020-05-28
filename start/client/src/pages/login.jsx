import React from "react";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { LoginForm, Loading } from "../components";
import ApolloClient from "apollo-client";

export const LOGIN_USER = gql`
	mutation login($email: String!) {
		login(email: $email)
	}
`;

export default function Login() {
	/*
	Returns a mutate function (login) and the data object returned from the mutation that we destructure
	Pass login function to the LoginForm component
	*/
	const client = useApolloClient(); // return currently configured client instance on context
	const [
		login,
		{ loading, error }
	] = useMutation(LOGIN_USER, {
		/* onCompeted callback function to store login token in localStorage to 
		persist the login between sessions.
		*/
		onCompleted({ login }) {
			localStorage.setItem("token", login);
			client.writeData({ data: { isLoggedIn: true } }); // write local data to Apollo cache
		}
	});
	if (loading) return <Loading />;
	if (error) return <p>An error occured</p>;
	return <LoginForm login={login} />;
}
