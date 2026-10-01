import LabModal from '../../lab-modal'

export default async function ModalPage({ params }: PageProps<'/lab/[slug]'>) {
	const { slug } = await params

	return <LabModal title={slug}>{slug}</LabModal>
}
