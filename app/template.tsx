import PageTransition from "@/components/page-transition";

/**
 * Re-mounts per navigation, which is what gives each arriving page its
 * entrance. It sits inside <main>, so header and footer stay put.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
