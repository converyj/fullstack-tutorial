import React, { Fragment } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { Loading, Header, LaunchTile } from "../components";
import { LAUNCH_TILE_DATA } from "./launches";

export const GET_MY_TRIPS = gql`
  query GetMyTrips {
    me {
      id
      email
      trips {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;

/* fetch a logged in user's list of trips. 
Apollo Client's fetch policy is cache-first (check the cache before the server)
- results are always changing and want the newest data, set the fetchPolicy to network-only 
*/

const Profile = () => {
	const { data, loading, error } = useQuery(GET_MY_TRIPS, { fetchPolicy: "network-only" });
	if (loading) return <Loading />;
	if (error) return <p>ERROR: {error.message}</p>;
	if (data === undefined) return <p>ERROR</p>;

	return (
		<Fragment>
			<Header>My Trips</Header>
			{data.me && data.me.trips.length ? (
				data.me.trips.map((launch) => <LaunchTile key={launch.id} launch={launch} />)
			) : (
				<p>You haven't booked any trips</p>
			)}
		</Fragment>
	);
};

export default Profile;
