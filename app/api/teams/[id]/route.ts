import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET TEAM BY ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const teamId = (await params).id;

		const team = await db.team.findFirst({
			where: { id: teamId },
			include: {
				members: true,
				submissions: { include: { submissionProblems: true } },
				batches: {
					include: {
						batch: true,
					},
				},
			},
		});

		if (!team)
			return NextResponse.json(
				{ message: "Team is not found" },
				{ status: 404 }
			);

		return NextResponse.json(
			{
				message: "Get team success",
				team,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting team:", error);
		return NextResponse.json(
			{ message: "Failed to fetch team" },
			{ status: 500 }
		);
	}
}

// DELETE TEAM
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const teamId = (await params).id;

		await db.team.delete({
			where: { id: teamId },
		});

		return NextResponse.json(
			{
				message: "Team deleted successfully",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting team:", error);
		return NextResponse.json(
			{ message: "Failed to delete team" },
			{ status: 500 }
		);
	}
}
