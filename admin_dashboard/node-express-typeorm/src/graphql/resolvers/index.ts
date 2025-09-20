import { userResolvers } from "./userResolvers";
import { authResolvers } from "./authResolvers";
import { courseResolvers } from "./courseResolvers";
import { applicationResolvers } from "./applicationResolvers";

export const resolvers = {
	Query: {
		...userResolvers.Query,
		...courseResolvers.Query,
		...applicationResolvers.Query,
	},
	Mutation: {
		...authResolvers.Mutation,
		...userResolvers.Mutation,
		...courseResolvers.Mutation,
	},
};

export default resolvers;
