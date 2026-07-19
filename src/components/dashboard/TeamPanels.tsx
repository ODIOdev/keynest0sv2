"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { roleLabel } from "@/lib/auth-types";
import type { AppRole } from "@/lib/auth-types";
import {
  ASSIGNABLE_ROLES,
  PERMISSION_MATRIX,
  ROLE_DETAILS,
  TEAM,
} from "@/lib/team";
import type { TeamInvite, TeamMember } from "@/lib/team-data";
import { AUTH } from "@/lib/auth-routes";

function Status({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (ok) return <p className="text-sm text-green-700">{ok}</p>;
  return null;
}

export function TeamOverview({
  orgName,
  memberCount,
  pendingInvites,
  yourRole,
  rolesInUse,
}: {
  orgName: string;
  memberCount: number;
  pendingInvites: number;
  yourRole: AppRole;
  rolesInUse: number;
}) {
  return (
    <div className="settings-panel space-y-5">
      <div>
        <h2 className="dash-panel__title" style={{ fontSize: "1.25rem" }}>
          {orgName}
        </h2>
        <p className="dash-panel__sub">Your role: {roleLabel(yourRole)}</p>
      </div>
      <div className="dash-grid dash-grid--stats" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {[
          { label: "Members", value: memberCount, tone: "accent" as const },
          { label: "Pending invites", value: pendingInvites, tone: "warn" as const },
          { label: "Roles in use", value: rolesInUse, tone: "success" as const },
        ].map((item) => (
          <article key={item.label} className={`dash-stat dash-stat--${item.tone}`}>
            <p className="dash-stat__label">{item.label}</p>
            <p className="dash-stat__value">{item.value}</p>
          </article>
        ))}
      </div>
      <div className="dash-actions">
        <Link href={TEAM.invite} className="btn-primary">
          Invite teammate
        </Link>
        <Link href={TEAM.members} className="btn-secondary">
          View members
        </Link>
      </div>
    </div>
  );
}

export function TeamInviteForm({
  orgId,
  canInvite,
}: {
  orgId: string;
  canInvite: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canInvite) {
      setError("You don’t have permission to invite members.");
      return;
    }
    setLoading(true);
    setOk("");
    setError("");
    setInviteUrl("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const role = String(form.get("role") || "employee") as AppRole;
    const token = crypto.randomUUID();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("kn_invitations").insert({
      org_id: orgId,
      email,
      role,
      invited_by: user?.id || null,
      token,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    const url = `${window.location.origin}${AUTH.invitation}?token=${token}`;
    setInviteUrl(url);
    setOk(`Invitation created for ${email}.`);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Invite teammate</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Send a link so they can join your organization.
        </p>
      </div>
      {!canInvite ? (
        <p className="text-sm text-[#758696]">
          Only roles with <code>team.invite</code> can send invites.
        </p>
      ) : (
        <>
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="colleague@company.com"
            />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" defaultValue="employee">
              {ASSIGNABLE_ROLES.filter((r) => r !== "owner").map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>
          <Status ok={ok} error={error} />
          {inviteUrl ? (
            <label className="field">
              <span>Invite link</span>
              <input readOnly value={inviteUrl} onFocus={(e) => e.target.select()} />
            </label>
          ) : null}
          <button className="btn-primary w-fit" disabled={loading}>
            {loading ? "Creating…" : "Create invite"}
          </button>
        </>
      )}
    </form>
  );
}

export function TeamMembersPanel({
  members,
  invites,
  currentUserId,
  canInvite,
  canUpdate,
  canRemove,
}: {
  members: TeamMember[];
  invites: TeamInvite[];
  currentUserId: string;
  canInvite: boolean;
  canUpdate: boolean;
  canRemove: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busyId, setBusyId] = useState("");
  async function updateRole(memberId: string, role: AppRole) {
    setBusyId(memberId);
    setError("");
    setOk("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("kn_memberships")
      .update({ role })
      .eq("id", memberId);
    setBusyId("");
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setOk("Role updated.");
    router.refresh();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member from the organization?")) return;
    setBusyId(memberId);
    setError("");
    setOk("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("kn_memberships")
      .delete()
      .eq("id", memberId);
    setBusyId("");
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setOk("Member removed.");
    router.refresh();
  }

  async function revokeInvite(inviteId: string) {
    setBusyId(inviteId);
    setError("");
    setOk("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("kn_invitations")
      .delete()
      .eq("id", inviteId);
    setBusyId("");
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setOk("Invite revoked.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="settings-panel space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#0c0407]">Members</h2>
            <p className="mt-1 text-sm text-[#758696]">
              People with access to this organization.
            </p>
          </div>
          {canInvite ? (
            <Link href={TEAM.invite} className="btn-primary">
              Invite
            </Link>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {canUpdate || canRemove ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.user_id === currentUserId;
                return (
                  <tr key={member.id}>
                    <td>
                      {member.kn_profiles?.full_name || "—"}
                      {isSelf ? (
                        <span className="ml-2 text-xs text-[#758696]">You</span>
                      ) : null}
                    </td>
                    <td>{member.kn_profiles?.email || "—"}</td>
                    <td>
                      {canUpdate && !isSelf && member.role !== "platform_admin" ? (
                        <select
                          className="rounded-lg border border-[#e8e8e8] bg-white px-2 py-1.5 text-sm"
                          value={member.role}
                          disabled={busyId === member.id}
                          onChange={(e) =>
                            updateRole(member.id, e.target.value as AppRole)
                          }
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        roleLabel(member.role)
                      )}
                    </td>
                    {canUpdate || canRemove ? (
                      <td>
                        {canRemove && !isSelf && member.role !== "owner" ? (
                          <button
                            type="button"
                            className="text-sm text-red-600 underline"
                            disabled={busyId === member.id}
                            onClick={() => removeMember(member.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Status ok={ok} error={error} />
      </div>

      <div className="settings-panel space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0c0407]">Pending invites</h2>
          <p className="mt-1 text-sm text-[#758696]">
            Waiting for someone to accept.
          </p>
        </div>
        {invites.length === 0 ? (
          <p className="text-sm text-[#758696]">No pending invites.</p>
        ) : (
          <ul className="settings-list">
            {invites.map((invite) => (
              <li key={invite.id}>
                <div>
                  <p className="font-medium text-[#0c0407]">{invite.email}</p>
                  <p className="text-sm text-[#758696]">
                    {roleLabel(invite.role)} · expires{" "}
                    {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
                {canRemove ? (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={busyId === invite.id}
                    onClick={() => revokeInvite(invite.id)}
                  >
                    Revoke
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function TeamRolesPanel() {
  return (
    <div className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Roles</h2>
        <p className="mt-1 text-sm text-[#758696]">
          What each role is meant to do in KeyNestOS.
        </p>
      </div>
      <div className="grid gap-3">
        {ROLE_DETAILS.map((item) => (
          <article
            key={item.role}
            className="rounded-2xl border border-[#e8e8e8] px-4 py-4"
          >
            <h3 className="font-semibold text-[#0c0407]">
              {roleLabel(item.role)}
            </h3>
            <p className="mt-1 text-sm text-[#758696]">{item.summary}</p>
            <ul className="mt-3 space-y-1 font-mono text-xs text-[#0c0407]">
              {item.permissions.map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TeamPermissionsPanel() {
  const roles: AppRole[] = [
    "owner",
    "manager",
    "realtor",
    "employee",
    "assistant",
    "tax_preparer",
  ];

  const groups = Array.from(
    PERMISSION_MATRIX.reduce((map, row) => {
      const list = map.get(row.group) || [];
      list.push(row);
      map.set(row.group, list);
      return map;
    }, new Map<string, typeof PERMISSION_MATRIX>()),
  );

  return (
    <div className="settings-panel space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Permissions</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Canonical access keys by role. Use these keys in product checks.
        </p>
      </div>

      {groups.map(([group, rows]) => (
        <section key={group} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#758696]">
            {group}
          </h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Permission</th>
                  {roles.map((role) => (
                    <th key={role}>{roleLabel(role)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <div>
                        <p className="font-mono text-xs text-[#0c0407]">
                          {row.key}
                        </p>
                        <p className="text-sm text-[#758696]">{row.label}</p>
                      </div>
                    </td>
                    {roles.map((role) => (
                      <td key={role}>{row.roles[role] ? "Yes" : "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

export function TeamEmptyState() {
  return (
    <div className="settings-panel space-y-3">
      <h2 className="text-xl font-semibold text-[#0c0407]">No organization yet</h2>
      <p className="text-sm text-[#758696]">
        Finish onboarding as a business account to create a workspace and invite
        your team.
      </p>
      <Link href="/onboarding/account" className="btn-primary w-fit">
        Continue onboarding
      </Link>
    </div>
  );
}
