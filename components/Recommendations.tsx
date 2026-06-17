type RecommendationsProps = {
  recommendations: string[];
};

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <section className="paper-card p-8">
      <p className="caption">Recommendations</p>
      <h2 className="mt-3 text-base font-medium text-[var(--text-primary)]">
        IT support action list
      </h2>

      <ol className="mt-8 grid gap-5">
        {recommendations.map((recommendation) => (
          <li
            key={recommendation}
            className="flex gap-5 border-b border-[var(--border)] pb-5 last:border-0 last:pb-0"
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/45" />
            <span className="text-sm leading-6 text-[var(--text-secondary)]">
              {recommendation}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
