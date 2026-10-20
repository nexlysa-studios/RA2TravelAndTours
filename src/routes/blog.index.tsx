import { pageSeo } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { SectionHeader } from "@/components/Section";
import { BLOG_POSTS } from "@/data/blog";

export const Route = createFileRoute("/blog/")({
  component: BlogPage,
  head: () =>
    pageSeo(
      "Cape Town Travel Journal | RA2 Travel & Tours",
      "Cape Town travel guides, local discoveries and ideas for your private South African journey with RA2 Travel & Tours.",
      "/blog",
    ),
});

function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="bg-background text-foreground">
      <Navbar forceTransformed />
      <main id="main-content" className="pt-24 lg:pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeader
            eyebrow="The RA2 Journal"
            title="Cape Town stories, guides & local tips"
            sub="Honest advice from the drivers and guides who live here — to help you plan a trip you'll actually remember."
          />

          {/* Featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group grid lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
              </div>
              <div className="p-8 lg:p-12">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Featured · {featured.category}
                </span>
                <h3 className="mt-3 font-display font-bold text-3xl lg:text-4xl text-balance">
                  {featured.title}
                </h3>
                <p className="mt-4 text-muted-foreground text-lg">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {featured.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {featured.readTime}
                  </span>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                  Read article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      {post.category}
                    </span>
                    <h3 className="mt-2 font-display font-bold text-xl text-balance">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.date}
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </div>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 rounded-3xl bg-primary text-primary-foreground p-10 lg:p-14 text-center">
            <h3 className="font-display font-bold text-2xl lg:text-3xl">
              Ready to experience Cape Town for yourself?
            </h3>
            <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
              Book a private shuttle or tour with RA2 and let our local team
              handle every detail.
            </p>
            <Link
              to="/"
              hash="book"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book your trip <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
