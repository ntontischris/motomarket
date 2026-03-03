"use client";

import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/types";
import { MOCK_ITEMS } from "@/lib/mock-catalog";
import ProductCard from "./ProductCard";

interface Props {
  message: ChatMessage;
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-4 py-1.5 animate-fade-in">
      <div className="max-w-[75%] md:max-w-[60%]">
        <div className="bg-brand-orange/15 border border-brand-orange/25 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  const { content, products } = message;
  const productItems = products
    ? products
        .map(code => MOCK_ITEMS.find(i => i.Code === code))
        .filter((i): i is (typeof MOCK_ITEMS)[0] => i !== undefined)
    : [];

  return (
    <div className="flex items-start gap-3 px-4 py-1.5 animate-slide-up">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-orange">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {/* Text */}
        {content && (
          <div className="bg-surface-700 border border-surface-500 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
            <div className="prose-chat">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {productItems.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl">
            {productItems.map(item => (
              <ProductCard key={item.Code} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageBubble({ message }: Props) {
  if (message.role === "user") return <UserBubble content={message.content} />;
  return <AssistantBubble message={message} />;
}
