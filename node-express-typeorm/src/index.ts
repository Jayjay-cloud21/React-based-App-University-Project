import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import userRoutes from "./routes/user.routes";
import courseRoutes from "./routes/course.routes";
import lecturerRoutes from "./routes/lecturer.routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3306;

app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", lecturerRoutes);

// start server only if not in test environment and AppDataSource is initialized
if (process.env.NODE_ENV !== "test") {
	AppDataSource.initialize()
		.then(() => {
			console.log("Data Source has been initialized!");
			app.listen(PORT, () => {
				console.log(`Server is running on port ${PORT}`);
			});
		})
		.catch((error) =>
			console.log("Error during Data Source initialization:", error)
		);
}

export default app;
