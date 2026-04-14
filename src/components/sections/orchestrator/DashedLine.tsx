/* ─── Connector line helper ─── */
const DashedLine = ({ height = "h-8", horizontal = false }: { height?: string; horizontal?: boolean }) => (
  <div
    className={horizontal ? "flex-1" : `flex justify-center ${height}`}
    aria-hidden="true"
  >
    <div
      className={horizontal ? "border-t-[1.5px] border-dashed w-full" : "w-0 border-l-[1.5px] border-dashed h-full"}
      style={{ borderColor: "var(--color-boost-connector)" }}
    />
  </div>
);

export default DashedLine;
