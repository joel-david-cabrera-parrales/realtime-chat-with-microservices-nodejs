import { Server } from "socket.io";
import { DataSource } from "typeorm";
import { domainEventPublisher } from "../../../plugins/events/events.provider";
import { ConversationRepositoryImpl } from "../../infrastructure/repositories/conversation.repository.impl";
import { TypeOrmConversationDataSource } from "../../infrastructure/datasources/typeorm-conversation.datasource";
import { ConversationDirectoryImpl } from "./conversation-directory.impl";
import { ChatEventListener } from "./listeners/chat-event.listener";
import { PresenceRegistry } from "./presence.registry";
import { SocketGateway } from "./socket.gateway";
import { TypingRegistry } from "./typing.registry";

export const realtimeFactory = {
  create(io: Server, dataSource: DataSource): SocketGateway {
    const conversationDataSource = new TypeOrmConversationDataSource(dataSource);
    const conversationRepository = new ConversationRepositoryImpl(conversationDataSource);
    const conversationDirectory = new ConversationDirectoryImpl(conversationRepository);

    const gateway = new SocketGateway(io, conversationDirectory, new PresenceRegistry(), new TypingRegistry());
    const listener = new ChatEventListener(gateway);

    domainEventPublisher.subscribe(listener);
    gateway.attach();

    return gateway;
  },
};
