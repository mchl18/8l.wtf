// export const generateStaticParams = async () => {
//   return ["8l.wtf", "8l.wtf/8l.wtf", "8l.wtf/8l.wtf/8l.wtf"].map((text) => ({
//     text,
//   }));
// };
// export const dynamic = "force-dynamic";

export default function QRPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
