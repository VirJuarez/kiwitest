interface CardProps {
  onClickAction: () => void;
  title: string;
  text: string;
  buttontext: string;
  color: string;
}

export default function NoObjectCard({
  onClickAction,
  title,
  text,
  buttontext,
  color,
}: CardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{text}</p>
        <button
          onClick={onClickAction}
          className={`${color} text-white px-4 py-2 rounded-lg  transition-colors`}
        >
          {buttontext}
        </button>
      </div>
    </div>
  );
}
