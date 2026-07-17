-- Allow org owners to read orgs before membership row exists
drop policy if exists "Members can view their kn orgs" on public.kn_organizations;
create policy "Members can view their kn orgs"
on public.kn_organizations for select
using (
  owner_id = auth.uid()
  or public.kn_is_org_member(id)
);
