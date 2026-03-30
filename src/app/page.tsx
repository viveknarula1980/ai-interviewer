import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import HomeClientWrapper from "./HomeClientWrapper";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  return <HomeClientWrapper session={session} />;
}
