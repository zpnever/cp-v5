import { useState, useEffect } from "react";
import {
	Calendar,
	Clock,
	Users,
	BookOpen,
	Award,
	CheckCircle,
	XCircle,
	Info,
	FileText,
	Code,
	ChevronRight,
	BarChart,
	RefreshCw,
	ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Batch, Problem } from "@/lib/types";
import { Button } from "../ui/button";

const DetailBatchById = ({ batchId }: { batchId: string }) => {
	const [batch, setBatch] = useState<Batch | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const getBatch = async () => {
			try {
				setLoading(true);
				const res = await fetch(`/api/batch/${batchId}`);

				if (!res.ok) {
					throw new Error("Failed to fetch batch data");
				}

				const data = await res.json();
				setBatch(data.batch);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				console.error("Error fetching batch:", err);
			} finally {
				setLoading(false);
			}
		};

		getBatch();
	}, [batchId]);

	if (loading) {
		return (
			<div className="flex flex-col gap-3 font-poppins justify-center items-center min-h-screen">
				<RefreshCw className="animate-spin text-black" size={32} />
				<div>Loading Detail Batch...</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="mx-auto max-w-3xl mt-6">
				<Info className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					Failed to load batch details: {error}
				</AlertDescription>
			</Alert>
		);
	}

	if (!batch) {
		return (
			<Alert className="mx-auto max-w-3xl mt-6">
				<Info className="h-4 w-4" />
				<AlertTitle>Not Found</AlertTitle>
				<AlertDescription>
					Batch information could not be found. Please check the batch ID and
					try again.
				</AlertDescription>
			</Alert>
		);
	}

	// Format time from seconds to HH:MM:SS
	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		return [
			hours.toString().padStart(2, "0"),
			minutes.toString().padStart(2, "0"),
			remainingSeconds.toString().padStart(2, "0"),
		].join(":");
	};

	// Calculate batch status
	const now = new Date();
	const startDate = new Date(batch.startedAt);
	const endDate = new Date(startDate.getTime() + batch.timer * 1000);

	let status = "Scheduled";
	if (now > endDate) {
		status = "Completed";
	} else if (now >= startDate) {
		status = "In Progress";
	}

	// Calculate progress percentage if in progress
	let progressPercentage = 0;
	if (status === "In Progress") {
		const totalTime = batch.timer * 60 * 1000;
		const elapsed = now.getTime() - startDate.getTime();
		progressPercentage = Math.min(Math.floor((elapsed / totalTime) * 100), 100);
	} else if (status === "Completed") {
		progressPercentage = 100;
	}

	const teamCount = batch.teams?.length || 0;
	const problemCount = batch.problems?.length || 0;
	const submissionCount = batch.submissions?.length || 0;

	return (
		<div className="container mx-auto p-4 max-w-6xl">
			{/* Batch Header */}
			<Button
				variant="outline"
				onClick={() => window.history.back()}
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Back to Batches
			</Button>
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-3xl font-bold">{batch.title}</h1>
					<Badge
						className={`px-3 py-1 text-sm ${
							status === "In Progress" ? "bg-green-500"
							: status === "Completed" ? "bg-blue-500"
							: "bg-yellow-500"
						}`}
					>
						{status}
					</Badge>
				</div>

				<div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
					<div className="flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						<span>
							Started: {new Date(batch.startedAt).toLocaleDateString("id-ID")}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						<span>Duration: {formatTime(batch.timer * 60)}</span>
					</div>
				</div>

				{batch.description && (
					<div className="bg-gray-50 p-4 rounded-lg mt-2">
						<p className="text-gray-700">{batch.description}</p>
					</div>
				)}
			</div>

			{/* Status Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-lg">
							<Users className="h-5 w-5 mr-2 text-indigo-600" />
							Teams
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{teamCount}</div>
						<p className="text-sm text-gray-500">Participating teams</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-lg">
							<BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
							Problems
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{problemCount}</div>
						<p className="text-sm text-gray-500">Challenges to solve</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-lg">
							<Code className="h-5 w-5 mr-2 text-indigo-600" />
							Submissions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{submissionCount}</div>
						<p className="text-sm text-gray-500">Total submissions made</p>
					</CardContent>
				</Card>
			</div>

			{/* Progress Section */}
			{status === "In Progress" && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Batch Progress</CardTitle>
						<CardDescription>
							Time remaining:{" "}
							{formatTime(
								batch.timer -
									Math.floor((now.getTime() - startDate.getTime()) / 1000)
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Progress value={progressPercentage} className="h-2" />
						<div className="flex justify-between mt-2 text-sm text-gray-500">
							<span>{progressPercentage}% completed</span>
							<span>Ends at {endDate.toLocaleString()}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Problems Section */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center">
						<BookOpen className="h-5 w-5 mr-2" />
						Problems
					</CardTitle>
					<CardDescription>
						{problemCount} problems in this batch
					</CardDescription>
				</CardHeader>
				<CardContent>
					{batch.problems && batch.problems.length > 0 ?
						<div className="space-y-2">
							{batch.problems.map((problem: Problem) => (
								<div
									key={problem.id}
									className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50"
								>
									<div>
										<h3 className="font-medium">{problem.title}</h3>
										<p className="text-sm text-gray-500">
											{problem.testCases?.length || 0} test cases
										</p>
									</div>
								</div>
							))}
						</div>
					:	<div className="text-center p-6 text-gray-500">
							No problems have been added to this batch yet.
						</div>
					}
				</CardContent>
			</Card>

			{/* Teams Section */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center">
						<Users className="h-5 w-5 mr-2" />
						Participating Teams
					</CardTitle>
					<CardDescription>{teamCount} teams registered</CardDescription>
				</CardHeader>
				<CardContent>
					{batch.teams && batch.teams.length > 0 ?
						<div className="space-y-2">
							{batch.teams.map((batchTeam) => (
								<div
									key={batchTeam.id}
									className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50"
								>
									<div className="flex items-center">
										<div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
											<span className="font-medium text-indigo-700">
												{batchTeam.team?.name?.charAt(0) || "T"}
											</span>
										</div>
										<div>
											<h3 className="font-medium">
												{batchTeam.team?.name || "Team"}
											</h3>
											<p className="text-sm text-gray-500">
												{batchTeam.isStart ? "Started" : "Not started"}
											</p>
										</div>
									</div>
									<Badge
										variant={batchTeam.isStart ? "default" : "outline"}
										className="ml-2"
									>
										{batchTeam.isStart ? "Active" : "Pending"}
									</Badge>
								</div>
							))}
						</div>
					:	<div className="text-center p-6 text-gray-500">
							No teams have registered for this batch yet.
						</div>
					}
				</CardContent>
			</Card>

			{/* Submissions Overview */}
			{submissionCount > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<BarChart className="h-5 w-5 mr-2" />
							Submission Statistics
						</CardTitle>
						<CardDescription>Overview of team performance</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{batch.submissions &&
								batch.submissions.slice(0, 5).map((submission) => (
									<div
										key={submission.id}
										className="flex items-center justify-between p-3 border rounded-md"
									>
										<div>
											<h3 className="font-medium">
												{submission.Team?.name || "Team"}
											</h3>
											<div className="flex items-center text-sm text-gray-500 mt-1">
												<CheckCircle className="h-4 w-4 mr-1 text-green-500" />
												<span>{submission.totalProblemsSolved} solved</span>
												<span className="mx-2">•</span>
												<span>Score: {submission.score}</span>
											</div>
										</div>
										<div className="text-right">
											<Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
												{submission.isFinish ? "Finished" : "In Progress"}
											</Badge>
											{submission.completionTime && (
												<p className="text-xs text-gray-500 mt-1">
													Time: {submission.completionTime}
												</p>
											)}
										</div>
									</div>
								))}
						</div>
					</CardContent>
					<CardFooter className="justify-center border-t pt-4">
						<button className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
							View all submissions
							<ChevronRight className="h-4 w-4 ml-1" />
						</button>
					</CardFooter>
				</Card>
			)}
		</div>
	);
};

export default DetailBatchById;
