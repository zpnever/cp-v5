"use client";

import { useState, useEffect } from "react";
import { User, Role, Submission } from "@/lib/types";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Mail,
	Calendar,
	Shield,
	Code,
	AlertTriangle,
	Users,
	Trophy,
	Clock,
	BadgeCheck,
	Activity,
	CheckCircle,
	XCircle,
	User as UserIcon,
	ExternalLink,
	PlusCircle,
	BarChart3,
	Edit,
	Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DetailUserById = ({ userId }: { userId: string }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				const res = await fetch(`/api/user/${userId}`);
				if (!res.ok) {
					throw new Error(`Failed to fetch user: ${res.statusText}`);
				}
				const data = await res.json();
				setUser(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred"
				);
				console.error("Error fetching user:", err);
			} finally {
				setLoading(false);
			}
		};

		// For demo purposes, simulate fetching with mock data
		const simulateFetch = () => {
			setTimeout(() => {
				// Mock user data based on real interface
				const mockUser: User = {
					id: userId,
					name: "Jawir Aseli",
					email: "jawir.aseli@nacomp.com",
					password: null,
					teamId: "team-123",
					otp: null,
					photo: null,
					isVerified: true,
					isDisqualified: false,
					role: Role.CONTESTANT,
					createdAt: new Date("2023-04-17T08:30:00Z"),
					updatedAt: new Date("2023-04-28T14:45:00Z"),
					submissions: [
						{
							id: "sub-001",
							userId: userId,
							teamId: "team-123",
							batchId: "batch-001",
							isFinish: true,
							score: 85,
							startAt: new Date("2023-04-20T10:00:00Z"),
							submittedAt: new Date("2023-04-20T11:30:00Z"),
							totalProblemsSolved: 4,
							completionTime: "01:30:00",
							submissionProblems: [],
						},
						{
							id: "sub-002",
							userId: userId,
							teamId: "team-123",
							batchId: "batch-002",
							isFinish: true,
							score: 92,
							startAt: new Date("2023-04-25T09:00:00Z"),
							submittedAt: new Date("2023-04-25T10:45:00Z"),
							totalProblemsSolved: 5,
							completionTime: "01:45:00",
							submissionProblems: [],
						},
					],
					Team: {
						id: "team-123",
						name: "Jawir Team",
						createdAt: new Date("2023-04-17T00:00:00Z"),
						updatedAt: new Date("2023-04-17T00:00:00Z"),
						isDisqualified: false,
						members: [],
						submissions: [],
						batches: [],
					},
				};

				setUser(mockUser);
				setLoading(false);
			}, 1000);
		};

		simulateFetch();
		// In a real app, use fetchUser() instead
		// fetchUser();
	}, [userId]);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const getInitials = (name: string | null) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const calculateAvgScore = (submissions: Submission[] | undefined) => {
		if (!submissions || submissions.length === 0) return 0;
		const total = submissions.reduce((sum, sub) => sum + sub.score, 0);
		return Math.round(total / submissions.length);
	};

	const getStatusColor = (isVerified: boolean, isDisqualified: boolean) => {
		if (isDisqualified) return "bg-red-600";
		if (isVerified) return "bg-green-500";
		return "bg-yellow-500";
	};

	if (loading) {
		return (
			<div className="w-full p-6 space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-16 w-16 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-6 w-52" />
						<Skeleton className="h-4 w-40" />
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="m-6">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{error}
					<Button variant="outline" size="sm" className="mt-4">
						Try Again
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center p-6 space-y-4">
				<AlertTriangle size={48} className="text-amber-500" />
				<h2 className="text-2xl font-bold">User Not Found</h2>
				<p className="text-gray-500">
					The user with ID {userId} could not be found.
				</p>
				<Button>Return to Users List</Button>
			</div>
		);
	}

	const averageScore = calculateAvgScore(user.submissions);

	return (
		<div className="w-full max-w-7xl mx-auto p-6 space-y-6">
			{/* User Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<div className="flex items-center gap-4">
					<Avatar className="h-16 w-16 border-2 border-primary">
						{user.photo ?
							<AvatarImage src={user.photo} alt={user.name || "User"} />
						:	<AvatarFallback className="text-lg font-medium bg-primary/10">
								{getInitials(user.name)}
							</AvatarFallback>
						}
					</Avatar>
					<div>
						<h1 className="text-2xl font-bold">
							{user.name || "Unnamed User"}
						</h1>
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<Mail size={14} />
							<span>{user.email}</span>
							<span
								className={`rounded-full h-2.5 w-2.5 ml-2 ${getStatusColor(user.isVerified, user.isDisqualified)}`}
							/>
							<span>
								{user.isDisqualified ?
									"Disqualified"
								: user.isVerified ?
									"Verified"
								:	"Unverified"}
							</span>
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						<Edit size={16} className="mr-2" />
						Edit User
					</Button>
					<Button
						size="sm"
						variant={user.isDisqualified ? "destructive" : "default"}
					>
						{user.isDisqualified ?
							<>
								<CheckCircle size={16} className="mr-2" />
								Remove Disqualification
							</>
						:	<>
								<XCircle size={16} className="mr-2" />
								Disqualify
							</>
						}
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							<div className="flex items-center gap-2">
								<Shield size={16} />
								Role
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{user.role === Role.ADMIN ? "Administrator" : "Contestant"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{user.role === Role.ADMIN ?
								"Full system access and management privileges"
							:	"Participation access to competitions"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							<div className="flex items-center gap-2">
								<Trophy size={16} />
								Performance
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{averageScore}/100</div>
						<Progress value={averageScore} className="h-2 mt-2" />
						<p className="text-xs text-muted-foreground mt-1">
							Average score across {user.submissions?.length || 0} submissions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							<div className="flex items-center gap-2">
								<Users size={16} />
								Team
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{user.Team?.name || "No Team"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{user.Team ?
								`Member since ${formatDate(user.Team.createdAt).split(",")[0]}`
							:	"User is not assigned to any team"}
						</p>
						{user.Team && (
							<Button
								variant="ghost"
								size="sm"
								className="mt-2 p-0 h-auto text-xs"
							>
								<ExternalLink size={12} className="mr-1" />
								View Team
							</Button>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Tabs Interface */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid grid-cols-4 md:w-fit">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="submissions">Submissions</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>User Information</CardTitle>
							<CardDescription>
								Detailed information about the user account
							</CardDescription>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									User ID
								</p>
								<p className="font-mono text-sm bg-muted p-2 rounded-md overflow-x-auto">
									{user.id}
								</p>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Email
								</p>
								<div className="flex items-center gap-2">
									<Mail size={16} />
									<p>{user.email}</p>
									{user.isVerified && (
										<BadgeCheck size={16} className="text-green-500" />
									)}
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Account Created
								</p>
								<div className="flex items-center gap-2">
									<Calendar size={16} />
									<p>{formatDate(user.createdAt)}</p>
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Last Updated
								</p>
								<div className="flex items-center gap-2">
									<Clock size={16} />
									<p>{formatDate(user.updatedAt)}</p>
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Account Status
								</p>
								<div className="flex items-center gap-2">
									{user.isDisqualified ?
										<Badge variant="destructive">Disqualified</Badge>
									: user.isVerified ?
										<Badge className="bg-green-500">Verified</Badge>
									:	<Badge variant="secondary">Pending Verification</Badge>}
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Role
								</p>
								<div className="flex items-center gap-2">
									<Shield size={16} />
									<p>{user.role}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{user.Team && (
						<Card>
							<CardHeader>
								<CardTitle>Team Information</CardTitle>
								<CardDescription>
									Details about the user{`'`}s team
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-4">
									<Avatar className="h-12 w-12 bg-primary/10">
										<AvatarFallback>
											{getInitials(user.Team.name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="font-medium">{user.Team.name}</h3>
										<p className="text-sm text-muted-foreground">
											Created on {formatDate(user.Team.createdAt).split(",")[0]}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-1">
										<p className="text-sm font-medium text-muted-foreground">
											Team ID
										</p>
										<p className="font-mono text-sm bg-muted p-2 rounded-md overflow-x-auto">
											{user.Team.id}
										</p>
									</div>

									<div className="space-y-1">
										<p className="text-sm font-medium text-muted-foreground">
											Status
										</p>
										<div className="flex items-center gap-2">
											{user.Team.isDisqualified ?
												<Badge variant="destructive">Disqualified</Badge>
											:	<Badge className="bg-green-500">Active</Badge>}
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant="outline" size="sm">
									<Eye size={16} className="mr-2" />
									View Team Details
								</Button>
							</CardFooter>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Competition Summary</CardTitle>
							<CardDescription>
								Overview of participation in competitions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="p-4 bg-muted rounded-lg text-center">
									<div className="text-3xl font-bold">
										{user.submissions?.length || 0}
									</div>
									<p className="text-muted-foreground">Total Competitions</p>
								</div>
								<div className="p-4 bg-muted rounded-lg text-center">
									<div className="text-3xl font-bold">
										{user.submissions?.reduce(
											(total, sub) => total + sub.totalProblemsSolved,
											0
										) || 0}
									</div>
									<p className="text-muted-foreground">Problems Solved</p>
								</div>
								<div className="p-4 bg-muted rounded-lg text-center">
									<div className="text-3xl font-bold">{averageScore}</div>
									<p className="text-muted-foreground">Average Score</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Submissions Tab */}
				<TabsContent value="submissions">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Submission History</CardTitle>
								<CardDescription>
									Record of past competition submissions
								</CardDescription>
							</div>
							<Button size="sm">
								<BarChart3 size={16} className="mr-2" />
								View Analytics
							</Button>
						</CardHeader>
						<CardContent>
							{user.submissions && user.submissions.length > 0 ?
								<Table>
									<TableCaption>
										A list of user{`'`}s recent submissions
									</TableCaption>
									<TableHeader>
										<TableRow>
											<TableHead>Batch ID</TableHead>
											<TableHead>Score</TableHead>
											<TableHead>Problems Solved</TableHead>
											<TableHead>Completion Time</TableHead>
											<TableHead>Submitted At</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{user.submissions.map((sub) => (
											<TableRow key={sub.id}>
												<TableCell className="font-medium">
													Batch #{sub.batchId.split("-")[1]}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															sub.score >= 90 ? "default"
															: sub.score >= 70 ?
																"secondary"
															:	"outline"
														}
														className={sub.score >= 90 ? "bg-green-500" : ""}
													>
														{sub.score}/100
													</Badge>
												</TableCell>
												<TableCell>{sub.totalProblemsSolved}</TableCell>
												<TableCell>{sub.completionTime}</TableCell>
												<TableCell>
													{sub.submittedAt ?
														formatDate(sub.submittedAt).split(",")[0]
													:	"N/A"}
												</TableCell>
												<TableCell>
													{sub.isFinish ?
														<Badge className="bg-green-500">Complete</Badge>
													:	<Badge variant="secondary">In Progress</Badge>}
												</TableCell>
												<TableCell className="text-right">
													<Button variant="ghost" size="sm">
														<Eye size={16} className="mr-2" />
														View
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							:	<div className="flex flex-col items-center justify-center h-48">
									<Code size={48} className="text-muted-foreground mb-4" />
									<p className="text-muted-foreground">No submissions found</p>
									<p className="text-sm text-muted-foreground">
										User has not participated in any competitions yet
									</p>
									<Button variant="outline" className="mt-4">
										<PlusCircle size={16} className="mr-2" />
										Assign to Batch
									</Button>
								</div>
							}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Activity Log Tab */}
				<TabsContent value="activity">
					<Card>
						<CardHeader>
							<CardTitle>Activity Log</CardTitle>
							<CardDescription>
								Recent user activities and system interactions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="mt-1 p-2 bg-primary/10 rounded-full">
										<Activity size={16} className="text-primary" />
									</div>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">Account Updated</span>
											<Badge variant="outline" className="ml-2">
												System
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											User information was updated
										</p>
										<p className="text-xs text-muted-foreground">
											{formatDate(user.updatedAt)}
										</p>
									</div>
								</div>

								{user.submissions?.map((sub, index) => (
									<div key={sub.id} className="flex items-start gap-4">
										<div className="mt-1 p-2 bg-primary/10 rounded-full">
											<Code size={16} className="text-primary" />
										</div>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">
													Submission Completed
												</span>
												<Badge variant="outline" className="ml-2">
													Competition
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												Completed Batch #{sub.batchId.split("-")[1]} with score{" "}
												{sub.score}/100
											</p>
											<p className="text-xs text-muted-foreground">
												{formatDate(sub.submittedAt || sub.startAt)}
											</p>
										</div>
									</div>
								))}

								<div className="flex items-start gap-4">
									<div className="mt-1 p-2 bg-primary/10 rounded-full">
										<UserIcon size={16} className="text-primary" />
									</div>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">Account Created</span>
											<Badge variant="outline" className="ml-2">
												System
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											User account was created
										</p>
										<p className="text-xs text-muted-foreground">
											{formatDate(user.createdAt)}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings">
					<Card>
						<CardHeader>
							<CardTitle>User Settings</CardTitle>
							<CardDescription>Manage user account settings</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-lg font-medium mb-2">Account Status</h3>
									<div className="flex items-center gap-4 mb-4">
										<div
											className={`h-4 w-4 rounded-full ${getStatusColor(user.isVerified, user.isDisqualified)}`}
										></div>
										<span>
											{user.isDisqualified ?
												"Disqualified"
											: user.isVerified ?
												"Verified"
											:	"Unverified"}
										</span>
									</div>
									<div className="flex gap-2">
										{!user.isVerified && (
											<Button size="sm">
												<CheckCircle size={16} className="mr-2" />
												Verify User
											</Button>
										)}
										<Button
											size="sm"
											variant={user.isDisqualified ? "outline" : "destructive"}
										>
											{user.isDisqualified ?
												<>
													<CheckCircle size={16} className="mr-2" />
													Remove Disqualification
												</>
											:	<>
													<XCircle size={16} className="mr-2" />
													Disqualify User
												</>
											}
										</Button>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-medium mb-2">Role Management</h3>
									<p className="text-sm mb-4">
										Current role: <Badge>{user.role}</Badge>
									</p>
									<Button size="sm">
										<Shield size={16} className="mr-2" />
										{user.role === Role.ADMIN ?
											"Change to Contestant"
										:	"Promote to Admin"}
									</Button>
								</div>
							</div>

							<div className="border-t pt-4 mt-4">
								<h3 className="text-lg font-medium mb-2">Team Assignment</h3>
								{user.Team ?
									<div className="space-y-2">
										<p className="text-sm">
											Currently assigned to{" "}
											<span className="font-medium">{user.Team.name}</span>
										</p>
										<div className="flex gap-2">
											<Button size="sm" variant="outline">
												<Eye size={16} className="mr-2" />
												View Team
											</Button>
											<Button size="sm" variant="destructive">
												<XCircle size={16} className="mr-2" />
												Remove from Team
											</Button>
										</div>
									</div>
								:	<div className="space-y-2">
										<p className="text-sm">User is not assigned to any team</p>
										<Button size="sm">
											<PlusCircle size={16} className="mr-2" />
											Assign to Team
										</Button>
									</div>
								}
							</div>

							<div className="border-t pt-4 mt-4">
								<h3 className="text-lg font-medium mb-2 text-red-500">
									Danger Zone
								</h3>
								<p className="text-sm text-muted-foreground mb-4">
									These actions cannot be undone
								</p>
								<div className="flex gap-2">
									<Button size="sm" variant="destructive">
										Delete User Account
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DetailUserById;
