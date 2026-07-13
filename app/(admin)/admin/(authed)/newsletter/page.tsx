import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Newsletter · Admin" };

export default function AdminNewsletterPage() {
  return (
    <PlaceholderPage
      title="Newsletter"
      sub="Subscribers, export CSV, unsubscribes."
      note="Vine la pasul 9."
    />
  );
}
