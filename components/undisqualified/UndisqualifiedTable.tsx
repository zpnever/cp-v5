"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Team } from "@/lib/types";
import toast from "react-hot-toast";

const UndisqualifiedTable = () => {
	const [teams, setTeams] = useState<Team[]>([]);
	const [selectedTeams, setSelectedTeams] = useState<any>({});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const getDisqualifiedTeam = async () => {
			try {
				const res = await fetch("/api/undisqualified");
				const json = await res.json();

				if (res.ok) {
					setTeams(json.teams || []);
					// Initialize selectedTeams with all teams set to false
					const initialSelectedState: any = {};
					json.teams?.forEach((team: Team) => {
						initialSelectedState[team.id] = false;
					});
					setSelectedTeams(initialSelectedState);
				}
			} catch (error) {
				console.error("Error fetching teams:", error);
			}
		};

		getDisqualifiedTeam();
	}, []);

	const handleSelectAll = (checked: any) => {
		const updatedSelectedTeams: any = {};
		teams.forEach((team) => {
			updatedSelectedTeams[team.id] = checked;
		});
		setSelectedTeams(updatedSelectedTeams);
	};

	const handleSelectTeam = (teamId: string, checked: any) => {
		setSelectedTeams((prev: any) => ({
			...prev,
			[teamId]: checked,
		}));
	};

	const handleSubmit = async () => {
		const teamsToUndisqualify = Object.entries(selectedTeams)
			.filter(([_, isSelected]) => isSelected)
			.map(([teamId]) => teamId);

		if (teamsToUndisqualify.length === 0) {
			toast.error("No teams selected");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/undisqualified", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ teamIds: teamsToUndisqualify }),
			});

			if (response.ok) {
				toast.success("Teams have been undisqualified successfully.");

				// Reset selections
				const resetSelections: any = {};
				teams.forEach((team) => {
					resetSelections[team.id] = false;
				});
				setSelectedTeams(resetSelections);

				// Refresh data
				const res = await fetch("/api/undisqualified");
				const json = await res.json();
				if (res.ok) {
					setTeams(json.teams || []);
				}
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to undisqualify teams.");
			}
		} catch (error) {
			toast.error("An error occurred while processing your request.");
		} finally {
			setIsLoading(false);
		}
	};

	const areAllSelected =
		teams.length > 0 && teams.every((team) => selectedTeams[team.id]);

	const isAnySelected = Object.values(selectedTeams).some(Boolean);

	return (
		<div className="space-y-4 container mx-auto px-4 py-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Undisqualify Teams</h2>
				<Button
					onClick={handleSubmit}
					disabled={!isAnySelected || isLoading}
					className="bg-blue-500 hover:bg-blue-600"
				>
					{isLoading ? "Processing..." : "Undisqualify Selected Teams"}
				</Button>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={areAllSelected}
									onCheckedChange={handleSelectAll}
									aria-label="Select all teams"
								/>
							</TableHead>
							<TableHead>Team ID</TableHead>
							<TableHead>Team Name</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Members</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{teams && teams.length > 0 ?
							teams.map((team) => (
								<TableRow key={team.id}>
									<TableCell>
										<Checkbox
											checked={selectedTeams[team.id] || false}
											onCheckedChange={(checked) =>
												handleSelectTeam(team.id, checked)
											}
											aria-label={`Select team ${team.name}`}
										/>
									</TableCell>
									<TableCell>{team.id}</TableCell>
									<TableCell className="font-medium">{team.name}</TableCell>
									<TableCell>
										{new Date(team.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												team.isDisqualified ?
													"bg-red-100 text-red-800"
												:	"bg-green-100 text-green-800"
											}`}
										>
											{team.isDisqualified ? "Disqualified" : "Active"}
										</span>
									</TableCell>
									<TableCell>{team.members?.length || 0} members</TableCell>
								</TableRow>
							))
						:	<TableRow>
								<TableCell colSpan={6} className="text-center py-6">
									{teams ? "No teams found" : "Loading teams..."}
								</TableCell>
							</TableRow>
						}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default UndisqualifiedTable;
