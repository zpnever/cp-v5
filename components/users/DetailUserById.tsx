"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	User,
	Mail,
	Calendar,
	Users,
	Shield,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Clock,
	RefreshCw,
} from "lucide-react";
import { Role, SubmissionProblem, User as UserType } from "@/lib/types";

const DetailUserById = ({ userId }: { userId: string }) => {
	const [user, setUser] = useState<UserType | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				const res = await fetch(`/api/users/${userId}`);
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

		fetchUser();
	}, [userId]);

	if (loading) {
		return (
			<div className="flex flex-col gap-3 font-poppins justify-center items-center min-h-screen">
				<RefreshCw className="animate-spin text-black" size={32} />
				<div>Loading Detail User...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Not Found</AlertTitle>
					<AlertDescription>User with ID {userId} not found.</AlertDescription>
				</Alert>
			</div>
		);
	}

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="max-w-3xl mx-auto p-6">
			<Card className="w-full overflow-hidden">
				<CardHeader className="pb-4">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16 border">
								<AvatarImage
									src={user.photo || undefined}
									alt={user.name || "User"}
								/>
								<AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
									{user.name ? user.name.charAt(0).toUpperCase() : "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className="text-2xl font-bold">
									{user.name || "Unnamed User"}
								</CardTitle>
								<CardDescription className="flex items-center mt-1">
									<Mail className="w-4 h-4 mr-1" />
									{user.email}
								</CardDescription>
							</div>
						</div>
						<div className="mt-4 md:mt-0">
							<Badge
								variant={user.role === Role.ADMIN ? "destructive" : "default"}
								className="text-xs"
							>
								<Shield className="w-3 h-3 mr-1" />
								{user.role}
							</Badge>
							{user.isVerified ?
								<Badge
									variant="outline"
									className="ml-2 bg-green-50 text-green-700 border-green-200"
								>
									<CheckCircle className="w-3 h-3 mr-1" />
									Verified
								</Badge>
							:	<Badge
									variant="outline"
									className="ml-2 bg-amber-50 text-amber-700 border-amber-200"
								>
									<Clock className="w-3 h-3 mr-1" />
									Pending Verification
								</Badge>
							}
							{user.isDisqualified && (
								<Badge
									variant="outline"
									className="ml-2 bg-red-50 text-red-700 border-red-200"
								>
									<XCircle className="w-3 h-3 mr-1" />
									Disqualified
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="pb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="border rounded-lg p-4 bg-gray-50">
								<h3 className="text-sm font-medium text-gray-500 mb-2">
									Account Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-2">
										<User className="w-4 h-4 text-gray-500 mt-1" />
										<div>
											<p className="text-sm font-medium">User ID</p>
											<p className="text-xs text-gray-600 break-all">
												{user.id}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Calendar className="w-4 h-4 text-gray-500 mt-1" />
										<div>
											<p className="text-sm font-medium">Created</p>
											<p className="text-xs text-gray-600">
												{formatDate(user.createdAt)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Clock className="w-4 h-4 text-gray-500 mt-1" />
										<div>
											<p className="text-sm font-medium">Last Updated</p>
											<p className="text-xs text-gray-600">
												{formatDate(user.updatedAt)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="border rounded-lg p-4 bg-gray-50">
								<h3 className="text-sm font-medium text-gray-500 mb-2">
									Team Information
								</h3>
								{user.Team ?
									<div className="space-y-3">
										<div className="flex items-start gap-2">
											<Users className="w-4 h-4 text-gray-500 mt-1" />
											<div>
												<p className="text-sm font-medium">Team Name</p>
												<p className="text-xs text-gray-600">
													{user.Team.name}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-2">
											<Calendar className="w-4 h-4 text-gray-500 mt-1" />
											<div>
												<p className="text-sm font-medium">Team Created</p>
												<p className="text-xs text-gray-600">
													{formatDate(user.Team.createdAt)}
												</p>
											</div>
										</div>
										{user.Team.isDisqualified && (
											<div className="mt-2">
												<Badge
													variant="outline"
													className="bg-red-50 text-red-700 border-red-200"
												>
													<XCircle className="w-3 h-3 mr-1" />
													Team Disqualified
												</Badge>
											</div>
										)}
									</div>
								:	<div className="flex items-center justify-center h-16">
										<p className="text-sm text-gray-500">No team associated</p>
									</div>
								}
							</div>
						</div>
					</div>

					{user.SubmissionProblem && user.SubmissionProblem.length > 0 && (
						<div className="mt-6">
							<h3 className="text-sm font-medium text-gray-500 mb-2">
								Recent Submissions
							</h3>
							<div className="border rounded-lg overflow-hidden">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Problem
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Submitted At
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{user.SubmissionProblem.map(
											(submission: SubmissionProblem) => (
												<tr key={submission.id}>
													<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
														{submission.problem?.title || "Unknown Problem"}
													</td>
													<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
														{formatDate(submission.submittedAt)}
													</td>
													<td className="px-4 py-2 whitespace-nowrap">
														{submission.success ?
															<Badge
																variant="outline"
																className="bg-green-50 text-green-700 border-green-200"
															>
																<CheckCircle className="w-3 h-3 mr-1" />
																Success
															</Badge>
														:	<Badge
																variant="outline"
																className="bg-red-50 text-red-700 border-red-200"
															>
																<XCircle className="w-3 h-3 mr-1" />
																Failed
															</Badge>
														}
													</td>
												</tr>
											)
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</CardContent>

				<CardFooter className="bg-gray-50 border-t px-6 py-4">
					<div className="flex items-center justify-between w-full">
						<div className="text-sm text-gray-500">
							{user.SubmissionProblem?.length || 0} total submissions
						</div>
						<div className="flex gap-2">
							{/* Action buttons would go here */}
						</div>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default DetailUserById;
