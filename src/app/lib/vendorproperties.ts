// lib/fetchVendorsWithProperties.ts

export type Vendor = {
  id: string;
  username?: string;
  email?: string;
  number?: string;
  role?: string;
  propertyCount?: number;
};

export const fetchVendorsWithProperties = async (
  token: string
): Promise<Vendor[]> => {
  const res = await fetch("https://server.festgo.in/api/admin/vendors", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch vendors");

  const data = await res.json();
  const vendorList: Vendor[] = Array.isArray(data) ? data : data.vendors || [];

  const vendorsWithProps = await Promise.all(
    vendorList.map(async (vendor) => {
      try {
        const propRes = await fetch(
          `https://server.festgo.in/api/admin/property/${vendor.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const propData = await propRes.json();
        const count = Array.isArray(propData?.properties)
          ? propData.properties.length
          : 0;

        return {
          ...vendor,
          propertyCount: count,
        };
      } catch {
        return { ...vendor, propertyCount: 0 };
      }
    })
  );

  return vendorsWithProps;
};
