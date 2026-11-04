// The template's Blog Posts section: four cards with photo, title and "date by author in category".
// Cards link out only when the client gives a link (the template's links went nowhere).
import SectionHeading from "@/components/SectionHeading";
import type { HomeContent } from "@/lib/content";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function News({ news }: { news: HomeContent["news"] }) {
  return (
    <div className="untree_co-section">
      <div className="container">
        <SectionHeading title={news.heading} intro={news.intro} />
        <div className="row">
          {news.items.map((post, i) => {
            const external = post.link ? { href: post.link, target: "_blank", rel: "noopener" } : null;
            const img = <img loading="lazy" src={post.image} alt={post.title} className="img-fluid" />;
            return (
              <div key={post.title + i} className="col-6 col-lg-3" data-reveal="fade-up">
                <div className="post-entry">
                  {post.image && (external ? <a className="thumb" {...external}>{img}</a> : <span className="thumb">{img}</span>)}
                  <h3>{external ? <a {...external}>{post.title}</a> : post.title}</h3>
                  <div className="post-meta">
                    {formatDate(post.date)}
                    {post.author && <> by {post.author}</>}
                    {post.category && <> in {post.category}</>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
