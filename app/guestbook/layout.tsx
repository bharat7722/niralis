import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave a Blessing — Harsh & Nirali",
  description:
    "Write a wish, a blessing, or a piece of advice for Harsh and Nirali, and read what other guests have left.",
};

export default function GuestbookLayout({ children }: LayoutProps<"/guestbook">) {
  return children;
}
