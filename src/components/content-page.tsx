import { db } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { whatsappUrl } from "@/lib/types";
import { WhatsappLogo, ArrowUpRight, Plus } from "./icons";
export async function ContentPage({ slug }: { slug: string }) {
  const [page, s] = await Promise.all([
    db.page.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!page) notFound();
  const links = [
    { slug: "about", label: "About Vaidora", href: "/about" },
    { slug: "contact", label: "Contact", href: "/contact" },
    { slug: "faq", label: "Common questions", href: "/faq" },
    { slug: "shipping", label: "Shipping", href: "/policies/shipping" },
    { slug: "returns", label: "Returns", href: "/policies/returns" },
    { slug: "privacy", label: "Privacy", href: "/policies/privacy" },
    { slug: "terms", label: "Terms", href: "/policies/terms" },
  ];
  return (
    <div className="container content-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>{page.title}</span>
      </nav>
      <header className="content-title">
        <h1>{page.title}</h1>
      </header>
      <div className="content-layout">
        <article className="content-prose">
          {slug === "faq" ? (
            <div className="faq-list">
              {page.content
                .split("\n")
                .filter(Boolean)
                .map((line, i) => {
                  const [q, ...a] = line.split("|");
                  return (
                    <details key={i}>
                      <summary>
                        <span>{q}</span>
                        <Plus size={20} aria-hidden="true" />
                      </summary>
                      <p>{a.join("|")}</p>
                    </details>
                  );
                })}
            </div>
          ) : (
            page.content
              .split("\n\n")
              .filter(Boolean)
              .map((p, i) => <p key={i}>{p}</p>)
          )}
        </article>
        <aside className="content-aside">
          <nav aria-label="Vaidora information">
            {links.map((link) => (
              <Link
                key={link.slug}
                href={link.href}
                aria-current={slug === link.slug ? "page" : undefined}
              >
                {link.label}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
          <div className="content-help">
            <h2>
              A question?
              <br />
              Let’s talk.
            </h2>
            <a
              className="button"
              href={whatsappUrl(
                s.whatsapp,
                `Hi Vaidora! I have a question about ${slug === "about" || slug === "contact" ? "your fragrances" : page.title.toLowerCase()}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogo size={23} />
              Ask Vaidora
              <ArrowUpRight size={19} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
