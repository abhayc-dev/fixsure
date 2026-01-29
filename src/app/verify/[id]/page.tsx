import Link from "next/link";
import { notFound } from "next/navigation";
import { getWarrantyByCode } from "@/lib/actions";
import VerifyCard from "@/components/verify-card";

// Fix for Next.js 15: params is a Promise
type Props = {
  params: Promise<{ id: string }>
}

export default async function VerifyPage(props: Props) {
  const params = await props.params;
  const data = await getWarrantyByCode(params.id);
  
  if (!data) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
      <VerifyCard data={data} />
    </div>
  );
}
