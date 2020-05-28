import React, { Fragment } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { LaunchTile, Header, Button, Loading } from "../components";

// GraphQL Fragment
export const LAUNCH_TILE_DATA = gql`
	fragment LaunchTile on Launch {
		id
		isBooked
		rocket {
			id
			name
		}
		mission {
			name
			missionPatch
		}
	}
`;

/*
Here, we're defining a query to fetch a list of launches by calling the launches query from our schema. 
The launches query returns an object type with a list of launches, in addition to the cursor of the 
paginated list and whether or not the list hasMore launches. 
We need to wrap the query with the gql function in order to parse it into an AST.
*/
const GET_LAUNCHES = gql`
	query launchList($after: String) {
		launches(after: $after) {
			
			hasMore
			launches {
				...LaunchTile
			}
		}
	}
	${LAUNCH_TILE_DATA}
`;

// pass query to Apollo's useQuery to render list
const Launches = () => {
	const { data, loading, error, fetchMore } = useQuery(GET_LAUNCHES);

	if (loading) return <Loading />;
	if (error) return <p>ERROR</p>;
	if (!data) return <p>Not found</p>;

	return (
		<Fragment>
			<Header />
			{data.launches &&
				data.launches.launches &&
				data.launches.launches.map((launch) => (
					<LaunchTile key={launch.id} launch={launch} />
				))}
			{/* 
			First, we check to see if we have more launches available in our query. If we do, we render a button with a click handler that calls the fetchMore function from Apollo. 
			The fetchMore function receives new variables for the list of launches query, which is represented by our cursor.
			We also define the updateQuery function to tell Apollo how to update the list of launches in the cache. To do this, we take the previous query result and combine it with the new query result from fetchMore. 
			*/}
			{data.launches &&
			data.launches.hasMore && (
				<Button
					onClick={() =>
						fetchMore({
							variables: {
								after: data.launches.cursor
							},

							updateQuery: (prev, { fetchMoreResult, ...rest }) => {
								if (!fetchMoreResult) return prev;
								return {
									...fetchMoreResult,
									launches: {
										...fetchMoreResult.launches,
										launches: [
											...prev.launches.launches,
											...fetchMoreResult.launches.launches
										]
									}
								};
							}
						})}>
					Load More
				</Button>
			)}
		</Fragment>
	);
};

export default Launches;
