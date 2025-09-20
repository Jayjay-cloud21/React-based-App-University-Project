import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Course } from "./Course";
import { Application } from "./Application";

export enum UserRole {
	LECTURER = "Lecturer",
	CANDIDATE = "Candidate",
	ADMIN = "Admin",
}

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column({ unique: true })
	email: string;

	@Column({
		type: "enum",
		enum: UserRole,
	})
	role: UserRole;

	@Column({ type: "boolean", default: false })
	isBlocked: boolean;

	@Column({ type: "varchar", length: 255 })
	password: string;

	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;

	// one lecturer can manage multiple courses
	@OneToMany(() => Course, (course) => course.lecturer)
	courses: Course[];

	// one user can have multiple applications
	@OneToMany(() => Application, (application) => application.user)
	applications: Application[];
}
