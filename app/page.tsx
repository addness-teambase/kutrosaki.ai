import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HomeInterface } from "@/components/home-interface";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <HomeInterface userId={user.id} />;
}
