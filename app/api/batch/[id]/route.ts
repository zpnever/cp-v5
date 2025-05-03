import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET BATCH BY ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const batchId = (await params).id;

		const batch = await db.batch.findFirst({
			where: { id: batchId },
			include: {
				teams: {
					include: {
						team: true,
					},
				},
				problems: {
					include: {
						testCases: true,
						languages: true,
					},
				},
				submissions: {
					include: {
						submissionProblems: true,
						Team: true,
					},
				},
			},
		});

		if (!batch)
			return NextResponse.json(
				{ message: "Batch is not found" },
				{ status: 404 }
			);

		return NextResponse.json(
			{
				message: "Get batch success",
				batch,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting batch:", error);
		return NextResponse.json(
			{ message: "Failed to fetch batch" },
			{ status: 500 }
		);
	}
}
