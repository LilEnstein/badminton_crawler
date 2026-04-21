import type { DistrictCatalog } from "@/application/profile/ports";

import seed from "../seed/districts.vn.json";

type SeedShape = Record<string, string[]>;

export class SeedDistrictCatalog implements DistrictCatalog {
  private readonly data: SeedShape;

  constructor(data: SeedShape = seed as SeedShape) {
    this.data = data;
  }

  exists(city: string, district: string): boolean {
    return this.data[city]?.includes(district) ?? false;
  }

  list(city: string): readonly string[] {
    return this.data[city] ?? [];
  }

  cities(): readonly string[] {
    return Object.keys(this.data);
  }
}
