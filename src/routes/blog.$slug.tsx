import { absoluteUrl, canonicalUrl, pageSeo } from "@/lib/seo";
import { SITE } from "@/data/site";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { BLOG_POSTS } from "@/data/blog";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post)
      return {
        meta: [
          { title: "Article not found | RA2 Travel & Tours" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    const path = `/blog/${post.slug}`;
    const publishedTime = new Date(`${post.date} 12:00:00 GMT+0200`).toISOString();
    return pageSeo(`${post.title} | ${SITE.name}`, post.excerpt, path, {
      image: post.image,
      imageAlt: post.title,
      type: "article",
      publishedTime,
      breadcrumbs: [
        { name: "Travel Journal", path: "/blog" },
        { name: post.title, path },
      ],
      schemas: [
        {
          "@type": "BlogPosting",
          "@id": `${canonicalUrl(path)}#article`,
          headline: post.title,
          description: post.excerpt,
          image: absoluteUrl(post.image),
          datePublished: publishedTime,
          author: { "@type": "Organization", name: SITE.name, url: SITE.url },
          publisher: { "@id": `${SITE.url}/#business` },
          mainEntityOfPage: { "@id": `${canonicalUrl(path)}#webpage` },
          articleSection: post.category,
          inLanguage: "en-ZA",
        },
      ],
    });
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-accent underline">
          Back to blog
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Link to="/blog" className="mt-4 inline-block text-accent underline">
          Back to blog
        </Link>
      </div>
    </div>
  ),
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      <Navbar forceTransformed />
      <main id="main-content" className="pt-24 lg:pt-28 pb-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {post.category}
            </span>
            <h1 className="mt-3 font-display font-bold text-4xl lg:text-5xl text-balance leading-tight">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">{post.excerpt}</p>
            <div className="mt-6 flex items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </motion.div>

          <div className="mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-border">
            <img
              src={post.image}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </section>

        {/* Body */}
        <article className="mx-auto max-w-3xl px-5 lg:px-8 mt-12">
          <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
            {post.content.map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl bg-primary text-primary-foreground p-8 lg:p-12 text-center">
            <h3 className="font-display font-bold text-2xl lg:text-3xl">
              Let us drive — you enjoy Cape Town
            </h3>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Private shuttles and tailor-made tours, run by locals who know the city inside out.
            </p>
            <Link
              to="/"
              hash="book"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book your trip <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-24">
            <h2 className="font-display font-bold text-2xl lg:text-3xl">Keep reading</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-display font-bold text-lg text-balance">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
