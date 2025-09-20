import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity()
export class Application {
	@PrimaryGeneratedColumn()
	applicationId: number;

	@Column()
	courseCode: string;

	@Column()
	availability: string;

	@Column("text")
	academicCredentials: string;

	@Column("text")
	previousRoles: string;

	@Column("text")
	skills: string;

	@Column({
		type: "enum",
		enum: ["Tutor", "Lab Assistant"],
		nullable: false,
	})
	type: string;

	@Column()
	userId: number;

	@Column()
	selected: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => User)
	@JoinColumn({ name: "userId" })
	user: User;

	@ManyToOne(() => Course)
	@JoinColumn({ name: "courseCode" })
	course: Course;
}
