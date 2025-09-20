import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Course } from "./entity/Course";
import { Application } from "./entity/Application";
import { SelectedApplication } from "./entity/SelectedApplication";
import { Comment } from "./entity/Comment";

export const AppDataSource = new DataSource({
	type: "mysql",
	host: "209.38.26.237",
	port: 3306,
	username: "S4040610",
	password: "PJ",
	database: "S4040610",
	// synchronize: true will automatically create database tables based on entity definitions
	// and update them when entity definitions change. This is useful during development
	// but should be disabled in production to prevent accidental data loss.
	synchronize: true,
	logging: true,
	entities: [User, Course, Application, SelectedApplication, Comment],
	migrations: [],
	subscribers: [],
});
