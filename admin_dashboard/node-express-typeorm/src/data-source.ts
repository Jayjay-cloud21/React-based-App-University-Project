import "reflect-metadata";
import { DataSource } from "typeorm";
import { Application } from  "./entity/Application";
import { Comment } from  "./entity/Comment";
import { Course } from  "./entity/Course";
import { SelectedApplication } from  "./entity/SelectedApplication";
import { User } from  "./entity/User";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  /* Change to your own credentials */
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
