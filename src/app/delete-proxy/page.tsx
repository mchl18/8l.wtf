"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense, useReducer } from "react";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type State = {
  id: string | null;
  status: "idle" | "loading" | "success" | "error";
  responseData: any;
};

type Action =
  | { type: "SET_ID"; payload: string }
  | { type: "SET_STATUS"; payload: "idle" | "loading" | "success" | "error" }
  | { type: "SET_RESPONSE_DATA"; payload: any };

const initialState: State = {
  id: null,
  status: "idle",
  responseData: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ID":
      return { ...state, id: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_RESPONSE_DATA":
      return { ...state, responseData: action.payload };
    default:
      return state;
  }
}

function DeleteProxyPage() {
  const searchParams = useSearchParams();
  const idFromSearchParams = searchParams.get("q");
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    id: idFromSearchParams,
  });

  const handleSubmit = async () => {
    dispatch({ type: "SET_STATUS", payload: "loading" });

    try {
      const response = await fetch(`/api/delete-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: state.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch proxy data");
      }

      const data = await response.json();
      dispatch({ type: "SET_RESPONSE_DATA", payload: data });
      dispatch({ type: "SET_STATUS", payload: "success" });
    } catch (err) {
      dispatch({ type: "SET_STATUS", payload: "error" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link className="mt-8" href="/">
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
          >
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center border-2 border-purple-600">
          <CardHeader>
            <CardTitle className="text-purple-600 text-2xl">
              Delete Proxy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <p className="text-purple-600">
                This is a proxy that allows you to call the DELETE method for a
                8l.wtf url by using the browser. This can be useful e.g.
                for an AWS signed delete url.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex flex-col gap-4"
              >
                <Input
                  type="text"
                  value={state.id || ""}
                  onChange={(e) => dispatch({ type: "SET_ID", payload: e.target.value })}
                  placeholder="Enter 8l.wtf ID"
                  required
                  className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                />

                <Button
                  type="submit"
                  disabled={state.status === "loading"}
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                >
                  {state.status === "loading" ? "Sending..." : "Send DELETE request"}
                </Button>
              </form>

              {state.status === "loading" && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}

              {state.status === "success" && state.responseData && (
                <div className="border-2 border-purple-600 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-purple-600">
                      Status: {state.responseData.status} {state.responseData.statusText}
                    </p>
                  </div>
                  <p className="text-purple-600 mt-2">
                    URL: {state.responseData.url}
                  </p>
                  <p className="text-purple-600">ID: {state.responseData.id}</p>
                </div>
              )}

              {state.status === "error" && (
                <div className="border-2 border-red-500 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <p className="text-red-500">Failed to fetch proxy data</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 min-w-[320px]">
      <div className="mt-8">
        <Skeleton className="h-10 w-10 bg-purple-600/20" />
      </div>

      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center border-2 border-purple-600">
        <CardHeader>
          <CardTitle className="text-purple-600 text-2xl">
            <Skeleton className="h-8 w-48 mx-auto bg-purple-600/20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-24 w-full bg-purple-600/20" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full bg-purple-600/20" />
              <Skeleton className="h-10 w-full bg-purple-600/20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
};

export default function Page() {
  return (
    <SuspenseWrapper>
      <DeleteProxyPage />
    </SuspenseWrapper>
  );
}
