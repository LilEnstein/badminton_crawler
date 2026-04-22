import type { FacebookGroup } from "@/domain/crawl";

import type { FacebookGroupRepository } from "./ports";

export interface ListGroupsDeps {
  repo: FacebookGroupRepository;
}

export class ListGroupsUseCase {
  constructor(private readonly deps: ListGroupsDeps) {}

  async execute(): Promise<FacebookGroup[]> {
    return this.deps.repo.findAll();
  }
}
