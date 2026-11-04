import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aagman Confirmation — Harsh & Nirali",
  description:
    "Let Harsh and Nirali know whether you can join them on 11 February 2027, and how many people are coming with you.",
};

export default function RsvpLayout({ children }: LayoutProps<"/rsvp">) {
  return children;
}
