interface ModalProps {
  title: string;
  text: string;
  btnText: string;
  btnHandler: () => void;
}

export default function Modal({
  title,
  text,
  btnText,
  btnHandler,
}: ModalProps) {
  return (
    <div className="modal__overlay">
      <div className="modal__window">
        <h2 className="modal__title">{title}</h2>
        <p className="modal__text">{text}</p>
        <button className="modal__button" onClick={btnHandler}>
          {btnText}
        </button>
      </div>
    </div>
  );
}
