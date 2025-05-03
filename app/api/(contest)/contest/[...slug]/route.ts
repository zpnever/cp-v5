import { db } from "@/lib/db";
import redis from "@/lib/redis";
import { NextResponse } from "next/server";

export const GET = async (
	req: Request,
	{ params }: { params: Promise<{ slug: string[] }> }
) => {
	const { slug } = await params;
	const [teamId, contestId] = slug;

	if (!contestId || !teamId)
		return NextResponse.json({ message: "Invalid id" }, { status: 400 });

	const submission = await db.submission.findFirst({
		where: {
			id: contestId,
		},
		include: {
			submissionProblems: true,
		},
	});

	const team = await db.team.findFirst({
		where: {
			id: teamId,
		},
		include: {
			members: true,
		},
	});

	if (!team)
		return NextResponse.json(
			{ message: "Your team is not found" },
			{ status: 400 }
		);

	const membersLength = team.members.length;

	if (!submission)
		return NextResponse.json(
			{ message: "Your contest is not found" },
			{ status: 400 }
		);

	const batch = await db.batch.findFirst({
		where: {
			id: submission.batchId,
		},
		include: {
			problems: true,
		},
	});

	if (!batch)
		return NextResponse.json(
			{ message: "Your contest is not found" },
			{ status: 400 }
		);

	const updated = await db.batchTeam.update({
		where: {
			batchId_teamId: {
				batchId: batch.id,
				teamId,
			},
		},
		data: {
			isStart: true,
		},
	});

	return NextResponse.json(
		{ message: "Success", data: { submission, batch, membersLength } },
		{ status: 200 }
	);
};
