import { ConsoleDomainEventListenerAdapter } from "./console-domain-event-listener.adapter";
import { InMemoryDomainEventPublisherAdapter } from "./in-memory-domain-event-publisher.adapter";

export const domainEventPublisher = new InMemoryDomainEventPublisherAdapter();

domainEventPublisher.subscribe(new ConsoleDomainEventListenerAdapter());
