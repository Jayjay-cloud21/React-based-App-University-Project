import "reflect-metadata";
import { DatabaseSeeder } from "./database-seeder";
import { AppDataSource } from "../data-source";

async function runSeeding() {
	try {
		console.log("🚀 Starting database seeding process...");

		// Initialize database connection
		await AppDataSource.initialize();
		console.log("📊 Database connected successfully");

		// Run the seeding
		await DatabaseSeeder.seedAll();

		console.log("🎉 Seeding completed successfully!");

		// Close the connection
		await AppDataSource.destroy();
		console.log("🔌 Database connection closed");

		process.exit(0);
	} catch (error) {
		console.error("❌ Seeding failed:", error);

		// Close the connection even if seeding fails
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
		}

		process.exit(1);
	}
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "clear") {
	// Clear all data
	AppDataSource.initialize()
		.then(() => DatabaseSeeder.clearAllData())
		.then(() => {
			console.log("✅ Database cleared successfully!");
			return AppDataSource.destroy();
		})
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("❌ Clear failed:", error);
			process.exit(1);
		});
} else if (command === "reseed") {
	// Clear and reseed
	AppDataSource.initialize()
		.then(() => DatabaseSeeder.reseedDatabase())
		.then(() => {
			console.log("✅ Database reseeded successfully!");
			return AppDataSource.destroy();
		})
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("❌ Reseed failed:", error);
			process.exit(1);
		});
} else {
	// Default: just seed (don't clear existing data)
	runSeeding();
}
