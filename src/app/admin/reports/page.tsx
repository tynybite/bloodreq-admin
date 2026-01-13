import { getReportsData } from "./actions";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const data = await getReportsData();

  return <ReportsClient data={data} />;
}
