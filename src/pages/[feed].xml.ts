// RSS feed at /rss.xml, generated only when at least one post is published.
import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { profile } from "../data/profile";

const getPosts = async () =>
  (await getCollection("posts", (post) => !post.data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

export const getStaticPaths = (async () =>
  (await getPosts()).length > 0 ? [{ params: { feed: "rss" } }] : []) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ site }) =>
  rss({
    title: profile.name,
    description: profile.tagline,
    site: site ?? "",
    items: (await getPosts()).map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
    })),
  });
