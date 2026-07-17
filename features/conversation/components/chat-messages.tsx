"use client";

import { isTextUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, ExternalLinkIcon, SearchIcon } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";

type WebSearchResult = {
  title?: unknown;
  url?: unknown;
  content?: unknown;
};

type WebSearchOutput = {
  results?: unknown;
  responseTime?: unknown;
};

type WebSearchPart = {
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function getQuery(input: unknown) {
  return isRecord(input) && typeof input.query === "string" ? input.query : undefined;
}

function getResults(output: unknown): WebSearchResult[] {
  if (!isRecord(output)) {
    return [];
  }

  const results = (output as WebSearchOutput).results;
  return Array.isArray(results)
    ? results.filter((result): result is WebSearchResult => isRecord(result))
    : [];
}

/** Displays streamed web-search activity without exposing raw tool JSON. */
function WebSearchCall({ part }: { part: WebSearchPart }) {
  const query = getQuery(part.input);
  const results = getResults(part.output);
  const isComplete = part.state === "output-available";
  const failed = part.state === "output-error";

  return (
    <Collapsible className="w-full max-w-2xl rounded-xl border bg-muted/40" defaultOpen={false}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/70">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {query ? `Searched the web for “${query}”` : "Searching the web…"}
        </span>
        <Badge variant={failed ? "destructive" : "secondary"}>
          {failed ? "Failed" : isComplete ? `${results.length} sources` : "Searching"}
        </Badge>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform [[data-panel-open]_&]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t px-3 py-2">
        {failed ? (
          <p className="text-sm text-destructive">{part.errorText ?? "The search could not be completed."}</p>
        ) : results.length ? (
          <ul className="space-y-2">
            {results.map((result, index) => {
              const title = typeof result.title === "string" ? result.title : "Untitled result";
              const url = typeof result.url === "string" ? result.url : undefined;
              const content = typeof result.content === "string" ? result.content : undefined;

              return (
                <li key={`${url ?? title}-${index}`} className="min-w-0">
                  {url ? (
                    <a className="inline-flex max-w-full items-center gap-1 text-sm font-medium text-primary hover:underline" href={url} rel="noreferrer" target="_blank">
                      <span className="truncate">{title}</span>
                      <ExternalLinkIcon className="size-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium">{title}</p>
                  )}
                  {content ? <p className="line-clamp-2 text-xs text-muted-foreground">{content}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{isComplete ? "No sources were found." : "Waiting for search results…"}</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
};

/**
 * Renders the conversation message list with markdown responses and a loading indicator.
 */
export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.parts.map((part, index) => {
                if (isTextUIPart(part)) {
                  return <MessageResponse key={index}>{part.text}</MessageResponse>;
                }

                if (part.type === "tool-webSearch") {
                  return <WebSearchCall key={part.toolCallId} part={part as WebSearchPart} />;
                }

                return null;
              })}
            </MessageContent>
          </Message>
        ))}

        {isWaiting ? (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
