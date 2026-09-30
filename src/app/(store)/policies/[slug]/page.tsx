import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
export default async function Policy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!["shipping", "returns", "privacy", "terms"].includes(slug)) notFound();
  return <ContentPage slug={slug} />;
}
