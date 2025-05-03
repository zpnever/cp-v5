"use client";

import React, { useEffect, useState } from "react";
import {
	Users,
	User as UserIcon,
	Calendar,
	Clock,
	Check,
	X,
	FileCode,
	BookOpen,
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	ArrowLeft,
	Star,
	RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Team, Submission, Role } from "@/lib/types"; // Assuming types are exported from this file

const DetailTeamById = ({ teamId }: { teamId: string }) => {
	const [team, setTeam] = useState<Team | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [openSubmission, setOpenSubmission] = useState<string | null>(null);
	const [openBatch, setOpenBatch] = useState<string | null>(null);

	useEffect(() => {
		const fetchTeam = async () => {
			try {
				setLoading(true);
				const res = await fetch(`/api/teams/${teamId}`);
				const data = await res.json();

				if (res.ok) {
					setTeam(data.team);
				} else {
					console.error("Failed to fetch team:", data.error);
				}
			} catch (error) {
				console.error("Error fetching team details:", error);
			} finally {
				setLoading(false);
			}
		};

		if (teamId) {
			fetchTeam();
		}
	}, [teamId]);

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (startDate: Date, endDate: Date | null) => {
		if (!endDate) return "In progress";

		const start = new Date(startDate).getTime();
		const end = new Date(endDate).getTime();
		const diff = Math.abs(end - start);

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};

	const calculateSuccessRate = (submission: Submission) => {
		if (
			!submission.submissionProblems ||
			submission.submissionProblems.length === 0
		) {
			return 0;
		}

		const successful = submission.submissionProblems.filter(
			(problem) => problem.success
		).length;
		return (successful / submission.submissionProblems.length) * 100;
	};

	if (loading) {
		return (
			<div className="flex flex-col gap-3 font-poppins justify-center items-center min-h-screen">
				<RefreshCw className="animate-spin text-black" size={32} />
				<div>Loading Detail Team...</div>
			</div>
		);
	}

	if (!team) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center space-y-4">
					<AlertTriangle className="text-amber-500 h-12 w-12 mx-auto" />
					<h2 className="text-2xl font-bold">Team Not Found</h2>
					<p className="text-gray-600">
						The team with ID {teamId} could not be found.
					</p>
					<Button
						variant="outline"
						onClick={() => window.history.back()}
						className="mt-4"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<div className="mb-6">
				<Button
					variant="outline"
					onClick={() => window.history.back()}
					className="mb-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
				</Button>

				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<div className="bg-blue-100 p-3 rounded-lg">
							<Users className="h-8 w-8 text-blue-600" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">{team.name}</h1>
							<div className="flex items-center space-x-2 mt-1">
								<Badge
									variant={team.isDisqualified ? "destructive" : "default"}
								>
									{team.isDisqualified ? "Disqualified" : "Active"}
								</Badge>
								<span className="text-gray-500 text-sm">ID: {team.id}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="outline" className="gap-2">
										<Calendar className="h-4 w-4" />
										Created {new Date(team.createdAt).toLocaleDateString()}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{formatDate(team.createdAt)}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid grid-cols-4 sm:w-[400px]">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="submissions">Submissions</TabsTrigger>
					<TabsTrigger value="batches">Batches</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center">
									<Users className="mr-2 h-5 w-5" />
									Team Members
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{team.members?.length || 0}
								</div>
								<p className="text-sm text-gray-500">Total members in team</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center">
									<FileCode className="mr-2 h-5 w-5" />
									Submissions
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{team.submissions?.length || 0}
								</div>
								<p className="text-sm text-gray-500">Total submissions made</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center">
									<BookOpen className="mr-2 h-5 w-5" />
									Batches
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{team.batches?.length || 0}
								</div>
								<p className="text-sm text-gray-500">Participated batches</p>
							</CardContent>
						</Card>
					</div>

					{team.submissions && team.submissions.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Recent Performance</CardTitle>
								<CardDescription>
									Latest submission results and statistics
								</CardDescription>
							</CardHeader>
							<CardContent>
								{team.submissions.slice(0, 3).map((submission) => (
									<div key={submission.id} className="mb-6 last:mb-0">
										<div className="flex items-center justify-between mb-2">
											<div>
												<h4 className="font-medium">
													{submission.batch?.title || "Batch Submission"}
												</h4>
												<p className="text-sm text-gray-500">
													{formatDate(submission.startAt)}
													{submission.submittedAt &&
														` - ${formatDate(submission.submittedAt)}`}
												</p>
											</div>
											<Badge
												variant={submission.isFinish ? "default" : "outline"}
											>
												{submission.isFinish ? "Completed" : "In Progress"}
											</Badge>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span>
													Problems Solved: {submission.totalProblemsSolved}
												</span>
												<span>Score: {submission.score}</span>
											</div>
											<Progress value={calculateSuccessRate(submission)} />
										</div>
									</div>
								))}
							</CardContent>
							{team.submissions.length > 3 && (
								<CardFooter>
									<Button variant="ghost" className="w-full" asChild>
										<a href="#submissions">View all submissions</a>
									</Button>
								</CardFooter>
							)}
						</Card>
					)}
				</TabsContent>

				{/* Members Tab */}
				<TabsContent value="members" className="">
					<Card>
						<CardHeader>
							<CardTitle>Team Members</CardTitle>
							<CardDescription>
								List of all members in {team.name}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[50px]">#</TableHead>
										<TableHead>Member</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Joined</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{team.members && team.members.length > 0 ?
										team.members.map((member, index) => (
											<TableRow key={member.id}>
												<TableCell>{index + 1}</TableCell>
												<TableCell className="font-medium">
													<div className="flex items-center space-x-3">
														<Avatar className="h-8 w-8">
															<AvatarImage
																src={member.photo || ""}
																alt={member.name || "User"}
															/>
															<AvatarFallback>
																{member.name ?
																	member.name.substring(0, 2).toUpperCase()
																:	"U"}
															</AvatarFallback>
														</Avatar>
														<span>{member.name || "Unnamed User"}</span>
													</div>
												</TableCell>
												<TableCell>{member.email}</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className={
															member.role === Role.ADMIN ?
																"bg-amber-100"
															:	"bg-blue-100"
														}
													>
														{member.role}
													</Badge>
												</TableCell>
												<TableCell>
													{member.isDisqualified ?
														<Badge variant="destructive">Disqualified</Badge>
													: !member.isVerified ?
														<Badge
															variant="outline"
															className="bg-amber-50 text-amber-700"
														>
															Not Verified
														</Badge>
													:	<Badge
															variant="outline"
															className="bg-green-50 text-green-700"
														>
															Active
														</Badge>
													}
												</TableCell>
												<TableCell>
													{new Date(member.createdAt).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))
									:	<TableRow>
											<TableCell colSpan={6} className="text-center h-24">
												<UserIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
												<p className="text-gray-500">
													No members found in this team
												</p>
											</TableCell>
										</TableRow>
									}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Submissions Tab */}
				<TabsContent value="submissions" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Team Submissions</CardTitle>
							<CardDescription>
								All submission history for {team.name}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{team.submissions && team.submissions.length > 0 ?
								<div className="space-y-4">
									{team.submissions.map((submission) => (
										<Collapsible
											key={submission.id}
											open={openSubmission === submission.id}
											onOpenChange={() =>
												setOpenSubmission(
													openSubmission === submission.id ?
														null
													:	submission.id
												)
											}
											className="border rounded-lg overflow-hidden"
										>
											<CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50">
												<div className="flex items-center space-x-3">
													<div
														className={`p-2 rounded-full ${submission.isFinish ? "bg-green-100" : "bg-amber-100"}`}
													>
														{submission.isFinish ?
															<Check className="h-4 w-4 text-green-600" />
														:	<Clock className="h-4 w-4 text-amber-600" />}
													</div>
													<div>
														<h4 className="font-medium">
															{submission.batch?.title || "Batch Submission"}
														</h4>
														<p className="text-sm text-gray-500">
															{formatDate(submission.startAt)}
															{submission.isFinish ?
																` • ${formatDuration(submission.startAt, submission.submittedAt)}`
															:	" • In progress"}
														</p>
													</div>
												</div>
												<div className="flex items-center space-x-4">
													<div className="text-right">
														<div className="flex items-center space-x-1">
															<Star className="h-4 w-4 text-amber-500" />
															<span className="font-semibold">
																{submission.score}
															</span>
														</div>
														<span className="text-sm text-gray-500">
															{submission.totalProblemsSolved} solved
														</span>
													</div>
													{openSubmission === submission.id ?
														<ChevronUp className="h-5 w-5 text-gray-500" />
													:	<ChevronDown className="h-5 w-5 text-gray-500" />}
												</div>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<Separator />
												<div className="p-4 bg-gray-50">
													<h5 className="font-medium mb-3">
														Problem Submissions
													</h5>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Problem</TableHead>
																<TableHead>Status</TableHead>
																<TableHead>Language</TableHead>
																<TableHead>Execution Time</TableHead>
																<TableHead>Memory</TableHead>
																<TableHead>Submitted</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{(
																submission.submissionProblems &&
																submission.submissionProblems.length > 0
															) ?
																submission.submissionProblems.map((problem) => (
																	<TableRow key={problem.id}>
																		<TableCell className="font-medium">
																			{problem.problem?.title ||
																				"Unknown Problem"}
																		</TableCell>
																		<TableCell>
																			{problem.success ?
																				<Badge className="bg-green-100 text-green-800 hover:bg-green-200">
																					Success
																				</Badge>
																			:	<Badge variant="destructive">
																					Failed
																				</Badge>
																			}
																		</TableCell>
																		<TableCell>
																			{problem.languageId ?
																				<span className="text-sm">
																					{problem.problem?.languages?.find(
																						(l) =>
																							l.languageId ===
																							problem.languageId
																					)?.name ||
																						`Language ID: ${problem.languageId}`}
																				</span>
																			:	<span className="text-gray-400">
																					Not submitted
																				</span>
																			}
																		</TableCell>
																		<TableCell>
																			{problem.executionTime !== null ?
																				<span>{problem.executionTime} ms</span>
																			:	<span className="text-gray-400">
																					N/A
																				</span>
																			}
																		</TableCell>
																		<TableCell>
																			{problem.memory !== null ?
																				<span>{problem.memory} KB</span>
																			:	<span className="text-gray-400">
																					N/A
																				</span>
																			}
																		</TableCell>
																		<TableCell>
																			{formatDate(problem.submittedAt)}
																		</TableCell>
																	</TableRow>
																))
															:	<TableRow>
																	<TableCell
																		colSpan={6}
																		className="text-center h-16"
																	>
																		<p className="text-gray-500">
																			No problem submissions found
																		</p>
																	</TableCell>
																</TableRow>
															}
														</TableBody>
													</Table>
												</div>
											</CollapsibleContent>
										</Collapsible>
									))}
								</div>
							:	<div className="text-center py-12">
									<FileCode className="mx-auto h-12 w-12 text-gray-400 mb-3" />
									<h3 className="text-lg font-medium text-gray-900">
										No Submissions Yet
									</h3>
									<p className="mt-1 text-gray-500">
										This team hasn{`'`}t made any submissions yet.
									</p>
								</div>
							}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Batches Tab */}
				<TabsContent value="batches" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Participated Batches</CardTitle>
							<CardDescription>
								All batches this team has participated in
							</CardDescription>
						</CardHeader>
						<CardContent>
							{team.batches && team.batches.length > 0 ?
								<div className="space-y-4">
									{team.batches.map((batchTeam) => (
										<Collapsible
											key={batchTeam.id}
											open={openBatch === batchTeam.id}
											onOpenChange={() =>
												setOpenBatch(
													openBatch === batchTeam.id ? null : batchTeam.id
												)
											}
											className="border rounded-lg overflow-hidden"
										>
											<CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50">
												<div className="flex items-center space-x-3">
													<div
														className={`p-2 rounded-full ${batchTeam.isStart ? "bg-green-100" : "bg-amber-100"}`}
													>
														{batchTeam.isStart ?
															<Check className="h-4 w-4 text-green-600" />
														:	<Clock className="h-4 w-4 text-amber-600" />}
													</div>
													<div>
														<h4 className="font-medium">
															{batchTeam.batch?.title || "Unknown Batch"}
														</h4>
														<p className="text-sm text-gray-500">
															Joined on {formatDate(batchTeam.createdAt)}
														</p>
													</div>
												</div>
												<div className="flex items-center">
													{batchTeam.isStart ?
														<Badge className="mr-3 bg-green-100 text-green-800 hover:bg-green-200">
															Started
														</Badge>
													:	<Badge variant="outline" className="mr-3">
															Not Started
														</Badge>
													}
													{openBatch === batchTeam.id ?
														<ChevronUp className="h-5 w-5 text-gray-500" />
													:	<ChevronDown className="h-5 w-5 text-gray-500" />}
												</div>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<Separator />
												<div className="p-4 bg-gray-50">
													{batchTeam.batch ?
														<div className="space-y-4">
															<div>
																<h5 className="font-medium">Batch Details</h5>
																<p className="text-sm text-gray-500 mt-1">
																	{batchTeam.batch.description ||
																		"No description available"}
																</p>
															</div>

															<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																<div className="p-3 bg-white rounded-lg border">
																	<p className="text-sm text-gray-500">
																		Started At
																	</p>
																	<p className="font-medium">
																		{formatDate(batchTeam.batch.startedAt)}
																	</p>
																</div>
																<div className="p-3 bg-white rounded-lg border">
																	<p className="text-sm text-gray-500">
																		Duration
																	</p>
																	<p className="font-medium">
																		{batchTeam.batch.timer} minutes
																	</p>
																</div>
																<div className="p-3 bg-white rounded-lg border">
																	<p className="text-sm text-gray-500">
																		Status
																	</p>
																	<p className="font-medium flex items-center">
																		{batchTeam.batch.publish ?
																			<>
																				<Check className="mr-1 h-4 w-4 text-green-600" />
																				Published
																			</>
																		:	<>
																				<X className="mr-1 h-4 w-4 text-red-600" />
																				Not Published
																			</>
																		}
																	</p>
																</div>
															</div>

															{batchTeam.batch.problems &&
																batchTeam.batch.problems.length > 0 && (
																	<div>
																		<h5 className="font-medium mb-2">
																			Problems in this Batch
																		</h5>
																		<div className="space-y-2">
																			{batchTeam.batch.problems.map(
																				(problem, index) => (
																					<div
																						key={problem.id}
																						className="p-2 bg-white rounded border flex justify-between items-center"
																					>
																						<div>
																							<span className="text-sm font-medium">
																								{index + 1}. {problem.title}
																							</span>
																						</div>
																						<Badge variant="outline">
																							{problem.languages?.length || 0}{" "}
																							languages
																						</Badge>
																					</div>
																				)
																			)}
																		</div>
																	</div>
																)}
														</div>
													:	<div className="text-center py-6">
															<AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
															<p className="text-gray-500">
																Batch details not available
															</p>
														</div>
													}
												</div>
											</CollapsibleContent>
										</Collapsible>
									))}
								</div>
							:	<div className="text-center py-12">
									<BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
									<h3 className="text-lg font-medium text-gray-900">
										No Batches Joined
									</h3>
									<p className="mt-1 text-gray-500">
										This team hasn{`'`}t participated in any batches yet.
									</p>
								</div>
							}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DetailTeamById;
