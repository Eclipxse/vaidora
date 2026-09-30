import { ContentPage } from "@/components/content-page";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!["about", "contact", "faq"].includes(page)) notFound();
  return <ContentPage slug={page} />;
}
