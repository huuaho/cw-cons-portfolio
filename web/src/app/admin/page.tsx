import AdminApp from "@/components/admin/AdminApp";

// Static shell; the Worker only serves it to people Cloudflare Access let in.
export default function AdminPage() {
  return <AdminApp />;
}
