import type { Metadata } from "next";
import GooeyNavbar from "@/components/GooeyNavbar";
import NotFoundHero from "@/components/not-found/NotFoundHero";
import { fetchStarCount } from "@/lib/github";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page does not exist. Browse the plugins or documentation instead.",
};

export default async function NotFound() {
  const stars = await fetchStarCount();

  return (
    <>
      <GooeyNavbar stars={stars} />

      <NotFoundHero />
    </>
  );
}
