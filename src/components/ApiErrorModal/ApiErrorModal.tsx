import Modal from "@/src/components/Modal";

export default function ErrorModal({
  error,
  btnHandler,
}: {
  error: Error | null;
  btnHandler: () => void;
}) {
  if (!error) return null;
  return (
    <Modal
      title={"Сталась помилка"}
      text={error.message}
      btnText={"Спробую пізніше"}
      btnHandler={() => btnHandler(null)}
    />
  );
}
