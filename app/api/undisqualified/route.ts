import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async () => {
	const teams = await db.team.findMany({
		where: {
			isDisqualified: true,
		},
		include: {
			members: true,
		},
	});

	return NextResponse.json({ teams }, { status: 200 });
};

export const POST = async (req: Request) => {
	const body = await req.json();
	const { teamIds } = body;

	if (teamIds.length === 0 || !teamIds)
		return NextResponse.json(
			{ message: "TeamIds is required" },
			{ status: 400 }
		);

	await Promise.all(
		teamIds.map((id: string) => {
			return db.team.update({
				where: {
					id,
				},
				data: {
					isDisqualified: false,
				},
			});
		})
	);

	return NextResponse.json(
		{ message: "Successfully undisqualified team" },
		{ status: 200 }
	);
};
