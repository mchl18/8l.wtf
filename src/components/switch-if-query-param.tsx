"use client";

import { useSearchParams } from "next/navigation";

export const SwitchIfQueryParam = ({
  children,
  switchTo,
  queryParamName,
}: {
  children: React.ReactNode;
  switchTo: React.ReactNode;
  queryParamName: string;
}) => {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get(queryParamName);
  if (queryParam) {
    return switchTo;
  }
  return <>{children}</>;
};
