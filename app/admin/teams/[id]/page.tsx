import DetailTeamById from "@/components/team/DetailTeamById";

const DetailTeamPage = async ({
	params,
}: {
	params: Promise<{ id: string }>;
}) => {
	const { id } = await params;
	return (
		<div>
			<DetailTeamById teamId={id} />
		</div>
	);
};

export default DetailTeamPage;
