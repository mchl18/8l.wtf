import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const HomeSkeleton = () => {
  return (
    <>
      <h1 className="text-purple-600 text-2xl mt-12 lg:mt-24">8l.wtf</h1>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full bg-purple-600/20" />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 bg-purple-600/20" />
                  <Skeleton className="h-10 w-10 bg-purple-600/20" />
                </div>
              </div>
              <div className="flex md:flex-row flex-col w-full gap-2 md:gap-1 justify-center md:items-center">
                <Skeleton className="h-10 flex-1 bg-purple-600/20" />
                <Skeleton className="h-10 md:w-[180px] w-full bg-purple-600/20" />
                <Skeleton className="h-10 flex-1 bg-purple-600/20" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 mt-4 justify-center">
          <Skeleton className="h-10 w-32 bg-purple-600/20" />
          <Skeleton className="h-10 w-32 bg-purple-600/20" />
          <Skeleton className="h-10 w-32 bg-purple-600/20" />
        </div>
      </>
    );
  };