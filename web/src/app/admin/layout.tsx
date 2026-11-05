import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: "Website editor",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main id="main">{children}</main>;
}
