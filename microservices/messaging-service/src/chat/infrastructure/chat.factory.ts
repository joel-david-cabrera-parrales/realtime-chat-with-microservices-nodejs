import { Router } from "express";
import { DataSource } from "typeorm";
import { jwtAdapter } from "../../plugins/jwt/jwt.provider";
import { domainEventPublisher } from "../../plugins/events/events.provider";
import { createValidateTokenMiddleware } from "../../shared/middlewares/validate-token.middleware";
import { AddParticipantUseCaseImpl } from "../application/use-cases/add-participant.use-case.impl";
import { CreateConversationUseCaseImpl } from "../application/use-cases/create-conversation.use-case.impl";
import { DeleteConversationUseCaseImpl } from "../application/use-cases/delete-conversation.use-case.impl";
import { DeleteMessageUseCaseImpl } from "../application/use-cases/delete-message.use-case.impl";
import { EditMessageUseCaseImpl } from "../application/use-cases/edit-message.use-case.impl";
import { GetConversationUseCaseImpl } from "../application/use-cases/get-conversation.use-case.impl";
import { GetMessageUseCaseImpl } from "../application/use-cases/get-message.use-case.impl";
import { LeaveConversationUseCaseImpl } from "../application/use-cases/leave-conversation.use-case.impl";
import { ListConversationsUseCaseImpl } from "../application/use-cases/list-conversations.use-case.impl";
import { ListMessagesUseCaseImpl } from "../application/use-cases/list-messages.use-case.impl";
import { MarkMessageDeliveredUseCaseImpl } from "../application/use-cases/mark-message-delivered.use-case.impl";
import { MarkMessageReadUseCaseImpl } from "../application/use-cases/mark-message-read.use-case.impl";
import { RemoveParticipantUseCaseImpl } from "../application/use-cases/remove-participant.use-case.impl";
import { RenameConversationUseCaseImpl } from "../application/use-cases/rename-conversation.use-case.impl";
import { SendMessageUseCaseImpl } from "../application/use-cases/send-message.use-case.impl";
import { ChatApplicationService } from "../application/services/chat.application.service";
import { ConversationLoader } from "../application/services/conversation-loader.service";
import { MessageLoader } from "../application/services/message-loader.service";
import { ChatAccessPolicy } from "../domain/services/chat-access-policy.service";
import { TypeOrmConversationDataSource } from "./datasources/typeorm-conversation.datasource";
import { TypeOrmMessageDataSource } from "./datasources/typeorm-message.datasource";
import { TypeOrmMessageReceiptDataSource } from "./datasources/typeorm-message-receipt.datasource";
import { ConversationRepositoryImpl } from "./repositories/conversation.repository.impl";
import { MessageReceiptRepositoryImpl } from "./repositories/message-receipt.repository.impl";
import { MessageRepositoryImpl } from "./repositories/message.repository.impl";
import { ChatController } from "./controllers/chat.controller";
import { ChatRouter } from "./routes/chat.router";

export const chatFactory = {
  createRouter(dataSource: DataSource): Router {
    const conversationDataSource = new TypeOrmConversationDataSource(dataSource);
    const messageDataSource = new TypeOrmMessageDataSource(dataSource);
    const messageReceiptDataSource = new TypeOrmMessageReceiptDataSource(dataSource);

    const conversationRepository = new ConversationRepositoryImpl(conversationDataSource);
    const messageRepository = new MessageRepositoryImpl(messageDataSource);
    const messageReceiptRepository = new MessageReceiptRepositoryImpl(messageReceiptDataSource);

    const conversationLoader = new ConversationLoader(conversationRepository);
    const messageLoader = new MessageLoader(messageRepository);
    const accessPolicy = new ChatAccessPolicy();

    const createConversationUseCase = new CreateConversationUseCaseImpl(conversationRepository);
    const listConversationsUseCase = new ListConversationsUseCaseImpl(conversationRepository, messageRepository);
    const getConversationUseCase = new GetConversationUseCaseImpl(conversationLoader, accessPolicy);
    const addParticipantUseCase = new AddParticipantUseCaseImpl(conversationRepository, conversationLoader, accessPolicy);
    const removeParticipantUseCase = new RemoveParticipantUseCaseImpl(conversationRepository, conversationLoader, accessPolicy);
    const leaveConversationUseCase = new LeaveConversationUseCaseImpl(conversationRepository, conversationLoader, accessPolicy);
    const renameConversationUseCase = new RenameConversationUseCaseImpl(conversationRepository, conversationLoader, accessPolicy);
    const deleteConversationUseCase = new DeleteConversationUseCaseImpl(conversationRepository, conversationLoader, accessPolicy);
    const sendMessageUseCase = new SendMessageUseCaseImpl(
      conversationRepository,
      messageRepository,
      conversationLoader,
      accessPolicy,
    );
    const listMessagesUseCase = new ListMessagesUseCaseImpl(messageRepository, conversationLoader, accessPolicy);
    const getMessageUseCase = new GetMessageUseCaseImpl(messageLoader, conversationLoader, accessPolicy);
    const editMessageUseCase = new EditMessageUseCaseImpl(messageRepository, messageLoader, conversationLoader, accessPolicy);
    const deleteMessageUseCase = new DeleteMessageUseCaseImpl(messageRepository, messageLoader, conversationLoader, accessPolicy);
    const markMessageDeliveredUseCase = new MarkMessageDeliveredUseCaseImpl(
      messageRepository,
      messageReceiptRepository,
      messageLoader,
      conversationLoader,
      accessPolicy,
    );
    const markMessageReadUseCase = new MarkMessageReadUseCaseImpl(
      messageRepository,
      messageReceiptRepository,
      messageLoader,
      conversationLoader,
      accessPolicy,
    );

    const chatService = new ChatApplicationService(
      createConversationUseCase,
      listConversationsUseCase,
      getConversationUseCase,
      addParticipantUseCase,
      removeParticipantUseCase,
      leaveConversationUseCase,
      renameConversationUseCase,
      deleteConversationUseCase,
      sendMessageUseCase,
      listMessagesUseCase,
      getMessageUseCase,
      editMessageUseCase,
      deleteMessageUseCase,
      markMessageDeliveredUseCase,
      markMessageReadUseCase,
      domainEventPublisher,
    );

    const chatController = new ChatController(chatService);
    const validateToken = createValidateTokenMiddleware(jwtAdapter);

    return new ChatRouter(chatController, validateToken).getRouter();
  },
};
