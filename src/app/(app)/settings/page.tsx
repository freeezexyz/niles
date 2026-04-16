"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TIERS } from "@/lib/utils/tiers";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  const tierConfig = TIERS[profile.tier];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your profile and account
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[var(--input)]"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-[var(--input)] opacity-50" />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold-500 text-background hover:bg-gold-600"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && (
              <span className="text-sm text-principle-trust">Saved</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">Current Plan:</span>
            <Badge variant="outline" className="border-gold-500 text-gold-500 font-display text-xs">
              {tierConfig.name}
            </Badge>
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p>
              Queries used:{" "}
              <span className="text-foreground font-medium">
                {profile.query_count}
              </span>
              {tierConfig.queryLimit > 0 && (
                <span> / {tierConfig.queryLimit}</span>
              )}
            </p>
            <p>
              Streak:{" "}
              <span className="text-foreground font-medium">
                {profile.streak_days} days
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
