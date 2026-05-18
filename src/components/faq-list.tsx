export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqList({
  items,
  heading = "Frequently asked questions",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{heading}</h2>
      <div className="rounded-lg border divide-y">
        {items.map((item, i) => (
          <details
            key={item.question}
            className="group"
            {...(i === 0 ? { open: true } : {})}
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium select-none flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors">
              <span>{item.question}</span>
              <span
                aria-hidden
                className="text-muted-foreground transition-transform group-open:rotate-45 text-lg leading-none shrink-0"
              >
                +
              </span>
            </summary>
            <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
