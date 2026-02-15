import { MicroSkillExamClient } from "@/components/exam/micro/MicroSkillExamClient";

export default async function MicroSkillExamPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { skillId } = await params;
  return <MicroSkillExamClient microSkillId={skillId} />;
}
