"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	const router = useRouter();

	return (
		<div>
			<div className="p-4">
				<Button
					variant="outline"
					onClick={() => router.push("/")}
					className="mb-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Landing Page
				</Button>
			</div>
			{children}
		</div>
	);
};

export default Layout;
