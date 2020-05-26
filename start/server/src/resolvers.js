const { paginateResults } = require("./utils");

// resolver for Query type in schema
module.exports = {
	Query: {
		launches: async (_, { pageSize = 20, after }, { dataSources }) => {
			const allLaunches = await dataSources.launchAPI.getAllLaunches();
			// we want these in reverse chronological order
			allLaunches.reverse();
			const launches = paginateResults({
				after,
				pageSize,
				results: allLaunches
			});
			return {
				launches,
				cursor: launches.length ? launches[launches.length - 1].cursor : null,
				// if the cursor at the end of the paginated results is the same as the
				// last item in allLaunches, then there are no more results after this
				hasMore: launches.length
					? launches[launches.length - 1].cursor !==
						allLaunches[allLaunches.length - 1].cursor
					: false
			};
		},
		launch: (_, { id }, { dataSources }) =>
			dataSources.launchAPI.getLaunchById({ launchId: id }),
		me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
	},

	/* obtains a large or small patch from mission, which is the object
	returned by the default resolver for the parent field in schema's Launch.mission
	*/
	Mission: {
		// The default size is 'LARGE' if not provided
		missionPatch: (mission, { size } = { size: "LARGE" }) => {
			return size === "SMALL" ? mission.missionPatchSmall : mission.missionPatchLarge;
		}
	},

	// add resolver for fields in Launch and User types
	Launch: {
		isBooked: async (launch, _, { dataSources }) =>
			dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id })
	},

	User: {
		trips: async (_, __, { dataSources }) => {
			// get ids of launches by user
			const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
			if (!launchIds.length) return [];
			// look up those lauches by their ids
			return dataSources.launchAPI.getLaunchesByIds({ launchIds }) || [];
		}
	},

	/* login resolver - returns a login token for a corresponding user 
	if a user doesn't exist for this email address, one is created
	refer to Apollo server in src/index.js
	*/
	Mutation: {
		login: async (_, { email }, { dataSources }) => {
			const user = await dataSources.userAPI.findOrCreateUser({ email });
			if (user) return Buffer.from(email).toString("base64");
		},

		// book launches and return booked launches
		bookTrips: async (_, { launchIds }, { dataSources }) => {
			const results = await dataSources.userAPI.bookTrips({ launchIds });
			console.log(results);
			const launches = await dataSources.launchAPI.getLaunchesByIds({
				launchIds
			});

			return {
				success: results && results.length === launchIds.length,
				message:
					results.length === launchIds.length
						? "trips booked successfully"
						: `the following launches couldn't be booked: ${launchIds.filter(
								(id) => !results.includes(id)
							)}`,
				launches
			};
		},

		// cancel launch and return cancelled launch
		cancelTrip: async (_, { launchId }, { dataSources }) => {
			const result = await dataSources.userAPI.cancelTrip({ launchId });

			if (!result)
				return {
					success: false,
					message: "failed to cancel trip"
				};

			const launch = await dataSources.launchAPI.getLaunchById({ launchId });
			return {
				success: true,
				message: "trip cancelled",
				launches: [
					launch
				]
			};
		}
	}
};
