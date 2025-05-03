import DetailUserById from "@/components/users/DetailUserById";

const DetailUserPage = async ({
	params,
}: {
	params: Promise<{ id: string }>;
}) => {
	const { id } = await params;
	return (
		<div>
			<DetailUserById userId={id} />
		</div>
	);
};

export default DetailUserPage;
