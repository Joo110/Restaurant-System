// src/components/dashboard/page/Placeholder.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface PlaceholderProps {
  name: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ name }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[40vh] sm:h-64 px-4">
      <div className="text-center">
        <div className="text-4xl sm:text-5xl mb-4">🚧</div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-500 capitalize">
          {name}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 mt-2">
          {t("dashboard.placeholder.underConstruction")}
        </p>
      </div>
    </div>
  );
};

export default Placeholder;