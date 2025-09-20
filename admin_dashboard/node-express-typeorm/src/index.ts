import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { expressMiddleware } from "@apollo/server/express4";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function startServer() {
	const apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
	});

	await apolloServer.start();

	app.use("/graphql", expressMiddleware(apolloServer));

	await AppDataSource.initialize();
	console.log("Data Source has been initialized!");

	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
		console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
	});
}

startServer().catch((error) =>
	console.log("Error during server initialization:", error)
);
