import gql from "graphql-tag";
import { GET_CART_ITEMS } from "./pages/cart";

/* client schema
  - extend the types of server schema
  - add local fields to server data (isInCart local field to the Launch type) 
  - using the extend keyword allows us to combine both schemas 
*/
export const typeDefs = gql`
	extend type Query {
		isLoggedIn: Boolean!
		cartItems: [ID!]!
	}

	extend type Launch {
		isInCart: Boolean!
	}

	extend type Mutation {
		addOrRemoveFromCart(id: ID!): [ID!]!
	}
`;

/*
Adding virtual fields to server data 
 - extend the type of the data you're adding the field to in your client schema
 - specify a client resolver on the Launch type to tell Apollo Client how to resolve the virtual field 
*/
export const schema = gql`
	extend type Launch {
		isInCart: Boolean!
	}
`;

export const resolvers = {
	Launch: {
		isInCart: (launch, _, { cache }) => {
			const queryResult = cache.readQuery({
				query: GET_CART_ITEMS
			});

			if (queryResult) {
				return queryResult.cartItems.includes(launch.id);
			}
			return false;
		}
	},
	Mutation: {
		addOrRemoveFromCart: (_, { id }, { cache }) => {
			const queryResult = cache.readQuery({
				query: GET_CART_ITEMS
			});

			// if item exists in the cart: remove from cart otherwise add it to cart
			if (queryResult) {
				const { cartItems } = queryResult;
				const data = {
					cartItems: cartItems.includes(id)
						? cartItems.filter((i) => i !== id)
						: [
								...cartItems,
								id
							]
				};

				cache.writeData({ query: GET_CART_ITEMS, data });
				return data.cartItems;
			}
			return [];
		}
	}
};
