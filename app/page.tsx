"use client";

import { useEffect, useState } from "react";
import ProfileIconDropdown from "@/components/auth/profile-icon-dropdown";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const TypewriterEffect = ({ phrases }: { phrases: any }) => {
	const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
	const [currentText, setCurrentText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const currentPhrase = phrases[currentPhraseIndex];

		const timeout = setTimeout(
			() => {
				if (!isDeleting) {
					// Typing
					if (currentText.length < currentPhrase.length) {
						setCurrentText(currentPhrase.substring(0, currentText.length + 1));
					} else {
						// Start deleting after a pause
						setTimeout(() => setIsDeleting(true), 1500);
					}
				} else {
					// Deleting
					if (currentText.length > 0) {
						setCurrentText(currentText.substring(0, currentText.length - 1));
					} else {
						setIsDeleting(false);
						setCurrentPhraseIndex(
							(prevIndex) => (prevIndex + 1) % phrases.length
						);
					}
				}
			},
			isDeleting ? 50 : 100
		);

		return () => clearTimeout(timeout);
	}, [currentText, currentPhraseIndex, isDeleting, phrases]);

	return (
		<div className="h-20 flex items-center justify-center text-center">
			<h1 className="text-4xl font-bold">
				<span>{currentText}</span>
				<span className="animate-pulse">|</span>
			</h1>
		</div>
	);
};

const HomePage = () => {
	const typewriterPhrases = [
		"Code. Compete. Conquer.",
		"Algorithms are your superpower.",
		"Solve problems, win competitions.",
		"Debug your limits.",
		"Think fast, code faster.",
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
			<header>
				<nav className="flex justify-between items-center bg-white px-8 h-16 shadow-md">
					<Link href="/" className="text-xl flex gap-1 items-center font-bold">
						<Image src="/logo1.svg" alt="logo.svg" width={24} height={24} />
						<Image
							src="/textLogo.svg"
							alt="textLogo.svg"
							width={80}
							height={28}
							className="h-7 w-auto"
						/>
					</Link>
					<ProfileIconDropdown />
				</nav>
			</header>

			<main className="container mx-auto px-4 py-12">
				<section className="flex flex-col items-center justify-center space-y-6 py-16">
					<div className="flex items-center justify-center mb-4">
						<Sparkles className="text-yellow-500 h-8 w-8 mr-2" />
						<h2 className="text-lg font-semibold text-gray-600">
							Challenge Your Logic
						</h2>
					</div>

					<TypewriterEffect phrases={typewriterPhrases} />

					<p className="text-xl text-gray-600 text-center max-w-2xl mt-4">
						🚀 Ready to test your coding skills? Join our Competitive
						Programming Contest and battle it out with the best! Great problems,
						real-time rankings, and awesome prizes await. Don{`'`}t miss it!
					</p>

					<div className="flex gap-4 mt-8">
						<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
							<Link
								className="flex"
								href="https://docs.google.com/forms/d/e/1FAIpQLSdkqrPCstbFJdCuAR_hhtiDKEfkrfhSWrsFEvFtcUIcM-kV1w/viewform?usp=send_form"
							>
								Join Competition <ChevronRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button size="lg" variant="outline">
							<Link href="https://drive.google.com/drive/folders/1d-s0TfVZKNuKj6CFmAC-9oKyxBuwYutH">
								Booklet
							</Link>
						</Button>
					</div>
				</section>
			</main>

			<footer className="bg-gray-800 text-white py-8">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center mb-4 md:mb-0">
							<Image
								src="/logo1.svg"
								alt="logo.svg"
								width={24}
								height={24}
								className="mr-2"
							/>
							<span className="font-bold text-lg">
								Inacomp Competitive Programming
							</span>
						</div>
						<div className="flex gap-8">
							<div></div>
						</div>
					</div>
					<div className="mt-8 text-center text-gray-400 text-sm">
						© {new Date().getFullYear()} Inacomp. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;
