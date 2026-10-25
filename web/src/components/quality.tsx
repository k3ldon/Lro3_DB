const QUALITY_LABEL = ["", "Común", "Poco común", "Raro", "Épico", "Legendario", "Mítico"];

export function QualityBadge({ quality }: { quality: number }) {
  return (
    <span className={`quality-${quality} q-border q-text inline-block rounded-full border bg-white px-2 py-0.5 text-[10px] font-semibold uppercase`}>
      {QUALITY_LABEL[quality] ?? `Q${quality}`}
    </span>
  );
}

export function qualityLabel(quality: number) {
  return QUALITY_LABEL[quality] ?? `Q${quality}`;
}
