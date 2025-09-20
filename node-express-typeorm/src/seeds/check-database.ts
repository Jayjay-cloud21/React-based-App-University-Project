import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Course } from "../entity/Course";
import { Application } from "../entity/Application";

async function checkDatabase() {
	try {
		await AppDataSource.initialize();
		console.log("📊 Connected to database");

		const userRepository = AppDataSource.getRepository(User);
		const courseRepository = AppDataSource.getRepository(Course);
		const applicationRepository = AppDataSource.getRepository(Application);

		// Count records
		const userCount = await userRepository.count();
		const courseCount = await courseRepository.count();
		const applicationCount = await applicationRepository.count();

		console.log("\n📈 DATABASE SUMMARY:");
		console.log(`👥 Users: ${userCount}`);
		console.log(`📚 Courses: ${courseCount}`);
		console.log(`📝 Applications: ${applicationCount}`);

		// Show breakdown by user role
		const adminCount = await userRepository.count({ where: { role: UserRole.ADMIN } });
		const lecturerCount = await userRepository.count({ where: { role: UserRole.LECTURER } });
		const candidateCount = await userRepository.count({ where: { role: UserRole.CANDIDATE } });

		console.log("\n👥 USER BREAKDOWN:");
		console.log(`   👑 Admins: ${adminCount}`);
		console.log(`   👨‍🏫 Lecturers: ${lecturerCount}`);
		console.log(`   🎓 Candidates: ${candidateCount}`);

		// Show some sample data
		console.log("\n📋 SAMPLE USERS:");
		const sampleUsers = await userRepository.find({ take: 5 });
		sampleUsers.forEach(user => {
			console.log(`   • ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
		});

		console.log("\n📚 SAMPLE COURSES:");
		const sampleCourses = await courseRepository.find({ take: 5 });
		sampleCourses.forEach(course => {
			console.log(`   • ${course.code}: ${course.name}`);
		});

		console.log("\n📝 RECENT APPLICATIONS:");
		const recentApplications = await applicationRepository.find({ 
			take: 5,
			order: { createdAt: 'DESC' }
		});
		recentApplications.forEach(app => {
			console.log(`   • User ${app.userId} applied for ${app.courseCode} as ${app.type} (Selected: ${app.selected})`);
		});

		await AppDataSource.destroy();
		console.log("\n✅ Database check completed");
	} catch (error) {
		console.error("❌ Error checking database:", error);
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
		}
	}
}

checkDatabase();
