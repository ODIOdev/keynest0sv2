import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { listProperties } from "@/lib/db";
import { DeletePropertyButton } from "@/components/dashboard/DeleteButtons";

export default async function PropertiesAdminPage() {
  const properties = listProperties();

  return (
    <DashboardFrame
      title="Properties"
      action={
        <Link href="/dashboard/properties/new" className="btn-primary">
          Add property
        </Link>
      }
    >
      <div className="overflow-x-auto rounded-3xl bg-white">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
              <th>Featured</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td className="font-medium">{property.title}</td>
                <td>{property.listingType}</td>
                <td>${property.price.toLocaleString()}</td>
                <td>{property.status}</td>
                <td>{property.featured ? "Yes" : "No"}</td>
                <td className="space-x-3 whitespace-nowrap">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="text-sm underline"
                  >
                    Edit
                  </Link>
                  <DeletePropertyButton id={property.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardFrame>
  );
}
