"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  dopabet_premium: boolean;
  email: string | null;
}

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase.from("profiles").select("email, dopabet_premium").eq("id", userId).single();
      setProfile(data as Profile | null);
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) loadProfile(data.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, loadProfile]);

  async function signInWithPassword(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return {
    user,
    profile,
    isPremium: profile?.dopabet_premium ?? false,
    loading,
    signInWithPassword,
    signUp,
    signOut,
  };
}
