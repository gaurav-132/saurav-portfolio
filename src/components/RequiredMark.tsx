export default function RequiredMark() {
  return (
    <>
      <span className="required-star" aria-hidden="true">*</span>
      <span className="sr-only"> required</span>
    </>
  );
}
