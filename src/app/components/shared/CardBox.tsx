"use client";

import { CustomizerContext } from "../shared/CustomizerContext";

import { Card } from "flowbite-react";
import React, { useContext } from "react";

interface MyAppProps {
  children: React.ReactNode;
  className?: string;
}
const CardBox: React.FC<MyAppProps> = ({ children, className }) => {
  const customizer = useContext(CustomizerContext);
  const isCardShadow = customizer?.isCardShadow ?? false;
  const isBorderRadius = customizer?.isBorderRadius ?? 0;
  return (
    <Card
      className={`card ${className} ${
        isCardShadow
          ? "dark:shadow-dark-md shadow-md "
          : "shadow-none border border-ld"
      } `}
      style={{
        borderRadius: `${isBorderRadius}px`,
      }}
    >
      {children}
    </Card>
  );
};

export default CardBox;
