const { gql } = require("apollo-server"); // gql function

/**
 * Define Schema Structure: 
 * 
 * Fetch a list of all upcoming rocket launches
 * Fetch a specific launch by its ID
 * Log in the user
 * Book one or more launches for a logged-in user
 * Cancel a previously booked launch for a logged-in user
 */
const typeDefs = gql`
	type Launch {
		id: ID!
		site: String
		mission: Mission
		rocket: Rocket
		isBooked: Boolean!
	}

	type Rocket {
		id: ID!
		name: String
		type: String
	}

	type User {
		id: ID!
		email: String!
		trips: [Launch]!
	}

	type Mission {
		name: String
		missionPatch(size: PatchSize): String
	}

	enum PatchSize {
		SMALL
		LARGE
	}

	"""
	fetch data
	Now, Query.launches takes in two parameters (pageSize and after) and returns a LaunchConnection object. The LaunchConnection includes:
		A list of launches (the actual data requested by a query)
		A cursor that indicates the current position in the data set
		A hasMore boolean that indicates whether the data set contains any more items beyond those included in launches
	"""
	type Query {
		launches(
			"""
			The number of results to show. Must be >=1. Default = 20
			"""
			pageSize: Int
			"""
			If you add a cursor here, it will only return results after this cursor
			"""
			after: String
		): LaunchConnection!
		launch(id: ID): Launch
		me: User
	}

	"""
	Simple wrapper around our list of launches that contains a cursor to the
	last item in the list. Pass this cursor to the launches query to fetch results
	after these.
	"""
	type LaunchConnection {
		cursor: String!
		hasMore: Boolean!
		launches: [Launch]!
	}

	# modify data
	type Mutation {
		bookTrips(launchIds: [ID]!): TripUpdateResponse!
		cancelTrip(launchId: ID!): TripUpdateResponse!
		login(email: String): String
	}

	type TripUpdateResponse {
		success: Boolean!
		message: String
		launches: [Launch]
	}
`;

module.exports = typeDefs;
