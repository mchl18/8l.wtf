import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1 className="text-purple-600 text-2xl mt-12 lg:mt-24">Not Found</h1>
      <div className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600 p-6">
        <p className="text-purple-600 mb-6">Could not find the requested resource</p>
        <Link
          href="/"
          className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150"
        >
          Return Home
        </Link>
      </div>
    </>
  );
}
