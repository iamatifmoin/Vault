import type { Metadata } from "next";
import { ProfileContent } from "@/components/profile/profile-content";
import { ProfileNotSetUp } from "@/components/profile/profile-not-set-up";
import { ProfileOwnerEmpty } from "@/components/profile/profile-owner-empty";
import { computeIRS } from "@/lib/algorithms";
import { auth } from "@/lib/auth";
import { getIndex, getPublicIndex } from "@/lib/github";
import { SHARE_BASE_URL } from "@/lib/share-cards";
import type { ProblemIndex } from "@/types";

interface PublicProfilePageProps {
  params: { username: string };
}

function getSiteUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  return `https://${SHARE_BASE_URL}`;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = params;
  const index = await getPublicIndex(username);
  const siteUrl = getSiteUrl();
  const ogImage = `${siteUrl}/og/profile.png`;

  if (!index) {
    return {
      title: `${username}'s Vault Profile`,
      description: "This profile hasn't been set up yet.",
      openGraph: {
        title: `${username}'s Vault Profile`,
        description: "This profile hasn't been set up yet.",
        images: [{ url: ogImage }],
      },
    };
  }

  const irsScore = computeIRS(index).score;

  return {
    title: `${username}'s Vault Profile`,
    description: `${username} has solved ${index.length} DSA problems. IRS: ${irsScore}/100`,
    openGraph: {
      title: `${username}'s Vault Profile`,
      description: `${username} has solved ${index.length} DSA problems. IRS: ${irsScore}/100`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Vault Profile`,
      description: `${username} has solved ${index.length} DSA problems. IRS: ${irsScore}/100`,
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = params;
  const session = await auth();
  const isOwner =
    session?.user?.login?.toLowerCase() === username.toLowerCase();

  let index: ProblemIndex[] | null;

  if (isOwner && session?.accessToken) {
    index = await getIndex(session.accessToken);
  } else {
    index = await getPublicIndex(username);
  }

  if (index === null && !isOwner) {
    return <ProfileNotSetUp username={username} />;
  }

  if (isOwner && session && (index === null || index.length === 0)) {
    return <ProfileOwnerEmpty session={session} />;
  }

  return (
    <ProfileContent
      index={index ?? []}
      username={username}
      session={session}
      isOwner={isOwner}
    />
  );
}
