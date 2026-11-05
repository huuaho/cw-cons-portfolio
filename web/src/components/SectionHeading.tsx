// The template's section title: bold heading, short intro and the wavy underline.
export default function SectionHeading({
  title,
  intro,
  align = "center",
}: {
  title: string;
  intro?: string;
  align?: "center" | "start";
}) {
  return (
    <div className="row mb-4">
      <div className={align === "center" ? "col-lg-7 text-center mx-auto" : "col-lg-6 text-start"}>
        <h2 className="section-heading mb-0" data-reveal="fade-up">
          <strong>{title}</strong>
        </h2>
        {intro && <p data-reveal="fade-up">{intro}</p>}
        <div className="wave" data-reveal="fade-up">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,6 Q12,0 25,6 T50,6 T75,6 T100,6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
