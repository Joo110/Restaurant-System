import React from "react";

interface PlaceholderProps {
  name: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-lg font-semibold text-gray-500 capitalize">
          {name}
        </h2>
        <p className="text-sm text-gray-300 mt-2">
          This page is under construction
        </p>
      </div>
    </div>
  );
};

export default Placeholder;