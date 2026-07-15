import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEmailTemplate } from "@/lib/admin/email-templates-queries";
import { getTemplateDef } from "@/lib/email/schema";
import { EmailEditor } from "./editor";

type Params = { key: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { key } = await params;
  const def = getTemplateDef(key);
  return { title: `${def?.name ?? key} · Emailuri · Admin` };
}

export default async function EmailTemplateEditorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { key } = await params;
  const row = await getEmailTemplate(key);
  if (!row) notFound();

  const def = getTemplateDef(key);
  if (!def) notFound();

  return (
    <EmailEditor
      templateKey={row.key}
      name={row.name}
      description={row.description}
      destination={row.destination}
      variables={row.variables}
      blocksSchema={def.blocks}
      initialSubject={row.subject}
      initialBlocks={row.blocks}
      defaultSubject={def.subject}
      isCustomized={row.isCustomized}
    />
  );
}
