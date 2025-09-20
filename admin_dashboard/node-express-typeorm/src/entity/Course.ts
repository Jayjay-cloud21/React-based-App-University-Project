import { AppDataSource } from "../data-source";
import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	PrimaryColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Course {
	@PrimaryColumn()
	code: string;

	@Column()
	name: string;

	@Column()
	startDate: string;

	@Column()
	endDate: string;

	@Column()
	description: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// foreign key to assigned lecturer
	@Column({ nullable: true })
	lecturerId: number | null;

	// many courses can be assigned to one lecturer
	@ManyToOne(() => User, (user) => user.courses)
	@JoinColumn({ name: "lecturerId" })
	lecturer: User;
}
