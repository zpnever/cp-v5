"use client";

import { useSubmissionStore } from "@/lib/zustand/logsStore";
import { ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import LogStatus from "./LogStatus";
import toast from "react-hot-toast";
import { Language, Problem, SubmissionProblem } from "@/lib/types";
import ProblemLayer from "./ProblemLayer";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EditorLayer, { EditorLayerHandle } from "./EditorLayer";
import CountdownTimer from "./ui/CountdownTimer";
import { Badge } from "@/components/ui/badge";

const languages = [
	{ name: "Javascript", id: "15" },
	{ name: "Python", id: "19" },
	{ name: "Ruby", id: "22" },
	{ name: "C++", id: "11" },
	{ name: "PHP", id: "18" },
	{ name: "Java", id: "14" },
	{ name: "Rust", id: "23" },
];

interface IProps {
	contestId: string;
	problemId: string;
	teamId: string | undefined;
	userId: string | undefined;
	onBack: () => void;
	startedAt: Date | string;
	duration: number;
	stepProblem: boolean;
	onFinish: () => void;
}

const useSocket = (url: string) => {
	const socketRef = useRef<Socket>(null);

	useEffect(() => {
		if (!socketRef.current) {
			const socket = io(url, {
				transports: ["websocket"],
				path: "/ws",
			});

			socketRef.current = socket;
		}
	}, [url]);

	return socketRef;
};

const ContestProblem = ({
	contestId,
	problemId,
	userId,
	teamId,
	startedAt,
	duration,
	onBack,
	onFinish,
	stepProblem,
}: IProps) => {
	const [isLoading, setIsLoading] = useState(true);
	const addLog = useSubmissionStore((s) => s.addLog);
	const setStatus = useSubmissionStore((s) => s.setStatus);
	const resetLogs = useSubmissionStore((s) => s.resetLogs);
	const [stepLogs, setStepLogs] = useState(false);
	const [problem, setProblem] = useState<Problem>();
	const [languageId, setLanguageId] = useState("15");
	const editorRef = useRef<EditorLayerHandle>(null);
	const [submissionProblem, setSubmissionProblem] = useState<
		SubmissionProblem | null | undefined
	>(null);
	const [draftCode, setDraftCode] = useState<Record<number, string>>();
	const socketRef = useSocket(
		process.env.NEXT_PUBLIC_SOCKET_URL || "wss://cp.inacomp.site"
	);

	useEffect(() => {
		const getProblem = async () => {
			const res = await fetch(`/api/problem-contest/${teamId}/${problemId}`);
			const json = await res.json();

			if (!res.ok) {
				toast.error(json.message);
				return;
			}

			setProblem(json.data.problem);

			const codeProblemDraftTemp: Record<number, string> = {};

			json.data.problem?.languages?.forEach((val: any) => {
				codeProblemDraftTemp[val.languageId] = val.functionTemplate;
			});

			if (json.data.submissionProblem) {
				setSubmissionProblem(json.data.submissionProblem);
				setLanguageId(String(json.data.submissionProblem.languageId));
				codeProblemDraftTemp[json.data.submissionProblem.languageId] =
					json.data.submissionProblem.code;

				setDraftCode(codeProblemDraftTemp);
			} else {
				setDraftCode(codeProblemDraftTemp);
			}
			setIsLoading(false);
		};

		getProblem();
	}, [problemId, teamId]);

	// LOGS
	useEffect(() => {
		const socket = socketRef.current;

		if (!socket) return;

		const roomId = `${userId}:${problemId}`;

		// Room joining flow with confirmation
		socket.emit("join-submission-room", { userId, problemId });

		socket.emit("join-contest-team-room", { userId, teamId, contestId });

		// Main events
		socket.on("submission-log", (data) => {
			if (data.roomId === roomId) {
				addLog(roomId, data.log);
			}
		});

		socket.on("submission-result", (data) => {
			if (data.roomId === roomId) {
				setStatus(roomId, data.status);
			}
		});

		return () => {
			socket.off("submission-log");
			socket.off("submission-result");
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, problemId]);

	useEffect(() => {
		fetch(`/api/problem-contest/${teamId}/${problemId}`)
			.then((res) => res.json())
			.then((data) => setSubmissionProblem(data.data.submissionProblem));
	}, [stepLogs, teamId, problemId]);

	const handleReset = async () => {
		const res = await fetch(`/api/problem-contest/${teamId}/${problemId}`);
		const json = await res.json();

		if (!res.ok) {
			toast.error("Error Reset");
			return;
		}

		const getLanguage: Language = json.data.problem.languages.filter(
			(lang: Language) => lang.languageId === parseInt(languageId)
		);

		setDraftCode((prev) => ({
			...prev,
			languageId: getLanguage.functionTemplate,
		}));
	};

	// Nembak api locked
	useEffect(() => {
		if (stepProblem) {
			const interval = setInterval(() => {
				fetch(`/api/locked-problem/${contestId}/${teamId}`).catch(() => {
					toast.error("Gagal refresh data soal terkunci");
				});
			}, 300000); // 5 Menit

			return () => clearInterval(interval);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contestId, teamId]);

	const handleOnBack = async () => {
		const roomId = `${teamId}:${contestId}`;

		resetLogs(`${teamId}:${problemId}`);

		const reqBody = {
			contestId,
			userId,
			teamId,
			problemId,
		};

		try {
			const res = await fetch(`/api/unlocked-problem`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(reqBody),
			});

			if (!res.ok) {
				toast.error("Failed to unlock problem");
				return;
			}

			const socket = socketRef.current;
			if (socket) {
				socket.emit("unlocked-check", {
					roomId,
					message: {
						userId,
						problemId,
					},
				});
			}

			onBack();
		} catch (error) {
			toast.error("Failed to unlock problem");
			console.error("Error unlocking problem:", error);
		}
	};

	const handleSubmit = async () => {
		const codeFromEditor = editorRef.current?.getCode();
		const roomId = `${userId}:${problemId}`;

		resetLogs(roomId);
		setStepLogs(true);

		const payloadBody = {
			userId,
			teamId,
			contestId,
			code: codeFromEditor,
			problemId,
			languageId,
		};

		if (codeFromEditor) {
			const res = await fetch(`/api/submission-problem`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payloadBody),
			});

			if (!res.ok) {
				alert("error api");
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
				<RefreshCw className="h-8 w-8 animate-spin text-gray-500 mb-4" />
				<h3 className="text-lg font-medium">Loading...</h3>
			</div>
		);
	}

	return (
		<div className="bg-white flex flex-col gap-4 w-full h-screen">
			{stepLogs && (
				<div className="inset-0 z-50 py-10 absolute min-h-screen bg-black/50 flex justify-center">
					<LogStatus
						key={`${userId}-${contestId}`}
						userId={userId!}
						problemId={problemId}
						onClose={() => setStepLogs(false)}
					/>
				</div>
			)}

			{/* Top layer */}
			<section className="flex flex-row justify-between items-center bg-white p-4 mx-6 rounded-b-lg shadow-lg">
				<div className="flex flex-row gap-4">
					<div className="border-r-1 border-gray-400 pr-4">
						<ArrowLeft className="cursor-pointer" onClick={handleOnBack} />
					</div>
					<h1>{problem?.title}</h1>
				</div>
				<div>
					<CountdownTimer
						startedAt={startedAt} // Konversi explisit ke Date
						durationMinutes={duration}
						onFinish={onFinish}
					/>
				</div>
			</section>

			{/* main layer */}
			<div className="flex justify-center h-[85%] w-full">
				<section className="flex flex-row gap-3 w-[95%] bg-transparent">
					{/* problem layer */}
					<section className="w-[45%] h-full flex flex-col">
						<div className="bg-white rounded-md border-2 border-black flex-1 overflow-hidden shadow-md">
							<div className="scrollable-area px-8 h-full overflow-auto bg-white">
								<ProblemLayer problem={problem!} />
							</div>
						</div>
					</section>

					{/* editor layer */}
					<section className="w-[55%] h-full flex flex-col overflow-hidden rounded-md border-2 border-black bg-gray-50 shadow-md">
						<div className="my-3 mx-3 flex items-center justify-between">
							<Select
								value={languageId}
								onValueChange={(value) => setLanguageId(value)}
							>
								<SelectTrigger className="w-35 border-2 border-black bg-white">
									<SelectValue placeholder="Select a Language" />
								</SelectTrigger>
								<SelectContent className="bg-white">
									{languages.map((lang) => (
										<SelectItem key={lang.id} value={lang.id}>
											{lang.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<div>
								<Button onClick={handleReset}>
									<RotateCcw />
									Reset Code
								</Button>
							</div>
						</div>
						<div className="h-full">
							<EditorLayer
								userId={userId!}
								problemId={problemId}
								draftCode={draftCode!}
								ref={editorRef}
								languageId={languageId}
							/>
						</div>
						<div className="bg-gray-100 px-4 flex justify-between items-center py-2 border-t border-gray-200">
							<div className="flex">
								<div
									onClick={() => setStepLogs(true)}
									className="cursor-pointer border-r-1 border-gray-400 pr-4"
								>
									Logs
								</div>
								<div className="ml-4">
									{submissionProblem?.success ?
										<div className="flex flex-row items-center gap-3">
											<div>
												<span>
													Memory :{" "}
													<span className="text-orange-700">
														{submissionProblem.memory}
													</span>{" "}
													KB{" "}
												</span>
												&
												<span>
													{" "}
													Time :{" "}
													<span className="text-orange-700">
														{submissionProblem.executionTime}
													</span>{" "}
													S
												</span>
											</div>

											<Badge variant="success" className="font-normal">
												Success
											</Badge>
										</div>
									:	<div></div>}
								</div>
							</div>
							<div>
								<Button
									size="sm"
									onClick={handleSubmit}
									className="w-20"
									variant="submit"
								>
									Submit
								</Button>
							</div>
						</div>
					</section>
				</section>
			</div>
		</div>
	);
};

export default ContestProblem;
