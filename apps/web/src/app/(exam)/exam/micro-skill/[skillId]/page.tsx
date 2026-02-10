import { MicroSkillPlayer } from "@/components/exam/MicroSkillPlayer";

export default async function MicroSkillExamPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  return <MicroSkillPlayer skillId={skillId} />;
}
