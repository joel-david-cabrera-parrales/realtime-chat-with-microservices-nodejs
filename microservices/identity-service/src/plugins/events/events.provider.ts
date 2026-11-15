import { InMemoryDomainEventPublisherAdapter } from "./in-memory-domain-event-publisher.adapter";

export const domainEventPublisher = new InMemoryDomainEventPublisherAdapter();
