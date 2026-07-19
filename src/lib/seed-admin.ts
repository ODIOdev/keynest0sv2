import { createServiceClient } from "@/lib/supabase/admin";
import {
  MASTER_ADMIN_EMAIL,
  MASTER_ADMIN_USERNAME,
} from "@/lib/master-admin";

export {
  MASTER_ADMIN_EMAIL,
  MASTER_ADMIN_USERNAME,
  resolveSignInEmail,
} from "@/lib/master-admin";

/**
 * Ensures a platform master admin exists in Supabase Auth + kn_profiles.
 * Idempotent — safe to run on startup or via npm script.
 */
export async function ensureMasterAdmin(password = "12345678") {
  const supabase = createServiceClient();

  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers({ perPage: 200 });

  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  let user = users?.find(
    (u) => u.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase(),
  );

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: MASTER_ADMIN_EMAIL,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Master Admin",
        account_type: "business",
        username: MASTER_ADMIN_USERNAME,
      },
    });

    if (error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
    user = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        full_name: "Master Admin",
        account_type: "business",
        username: MASTER_ADMIN_USERNAME,
      },
    });
    if (error) {
      throw new Error(`Failed to update admin user: ${error.message}`);
    }
  }

  if (!user) {
    throw new Error("Admin user missing after create/update");
  }

  const { error: profileError } = await supabase.from("kn_profiles").upsert(
    {
      id: user.id,
      email: MASTER_ADMIN_EMAIL,
      full_name: "Master Admin",
      account_type: "business",
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error(`Failed to upsert admin profile: ${profileError.message}`);
  }

  const { data: existingOrg } = await supabase
    .from("kn_organizations")
    .select("id")
    .eq("slug", "keynestos")
    .maybeSingle();

  let orgId = existingOrg?.id as string | undefined;

  if (!orgId) {
    const { data: org, error: orgError } = await supabase
      .from("kn_organizations")
      .insert({
        name: "KeyNestOS",
        slug: "keynestos",
        industry: "Real estate",
        subscription_plan: "enterprise",
        branding: { primary: "#0c0407" },
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (orgError) {
      throw new Error(`Failed to create admin org: ${orgError.message}`);
    }
    orgId = org.id;
  } else {
    await supabase
      .from("kn_organizations")
      .update({ owner_id: user.id })
      .eq("id", orgId);
  }

  const { data: membership } = await supabase
    .from("kn_memberships")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    const { error: memberError } = await supabase.from("kn_memberships").insert({
      org_id: orgId,
      user_id: user.id,
      role: "platform_admin",
    });
    if (memberError) {
      throw new Error(`Failed to create admin membership: ${memberError.message}`);
    }
  } else {
    await supabase
      .from("kn_memberships")
      .update({ role: "platform_admin" })
      .eq("id", membership.id);
  }

  return {
    id: user.id,
    email: MASTER_ADMIN_EMAIL,
    username: MASTER_ADMIN_USERNAME,
  };
}
