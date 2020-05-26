// Hooking up REST API: https://api.spacexdata.com/v2/

const { RESTDataSource } = require("apollo-datasource-rest"); // RESTDataSource class for fetching data

class LaunchAPI extends RESTDataSource {
	constructor() {
		super();
		this.baseURL = "https://api.spacexdata.com/v2/";
	}

	// reducer
	launchReducer(launch) {
		return {
			id: launch.flight_number || 0,
			site: launch.launch_site && launch.launch_site.site_name,
			mission: {
				name: launch.mission_name,
				missionPatchSmall: launch.links.mission_patch_small,
				missionPatchLarge: launch.links.mission_patch
			},
			rocket: {
				id: launch.rocket.rocket_id,
				name: launch.rocket.rocket_name,
				type: launch.rocket.rocket_type
			}
		};
	}

	/**
	 * makes GET request to 
	 * stores the launches in the response variable 
	 * maps over the launches and transforms the response with the launch reducer 
	 */
	async getAllLaunches() {
		const response = await this.get("launches");
		return Array.isArray(response) ? response.map((launch) => this.launchReducer(launch)) : [];
	}

	/**
	 * fetching a specific launch by its ID called from book/cancelTrips in Mutation type
	 */
	async getLaunchById({ launchId }) {
		const response = await this.get("launches", { flight_number: launchId });
		return this.launchReducer(response[0]);
	}

	/**
	 * fetching more than one launch by IDs
	 */
	getLaunchesByIds({ launchIds }) {
		return Promise.all(launchIds.map((launchId) => this.getLaunchById(launchId)));
	}
}

module.exports = LaunchAPI;
