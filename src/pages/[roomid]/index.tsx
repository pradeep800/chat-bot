import { useRouter } from "next/router";
import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { api } from "~/utils/api";
import { useRef } from "react";
import Messages from "~/components/messages";
import { toast } from "react-hot-toast";
import Loading from "~/components/loading";
export default function Pages() {
  const router = useRouter();
  const roomId = useRef<number>(parseInt(router.query.roomid as string));
  const utils = api.useContext();
  const lastDiv = useRef<HTMLDivElement>(null);
  const [scrollDown, setScrollDown] = useState("not-down");
  const [isAsking, setIsAsking] = useState(false);
  const askQuestionInput = useRef<HTMLInputElement>(null);
  /*
   * It is for optimistic updates in data and asking question
   */
  const { mutate } = api.conversations.askQuestion.useMutation({
    onSuccess: (data) => {
      const prevPages = utils.conversations.infiniteMessage.getInfiniteData({
        roomId: roomId.current,
      });
      const prev = prevPages?.pages[0];

      if (!prev) return;
      setScrollDown("down");
      setIsAsking(false);
      utils.conversations.infiniteMessage.setInfiniteData(
        { roomId: data.roomId },
        () => {
          prev?.shift();
          prev?.unshift(data);

          const updatedPages = { ...prevPages };
          updatedPages.pages[0] = prev;
          return updatedPages;
        }
      );
    },
    onMutate(message) {
      const prevPages = utils.conversations.infiniteMessage.getInfiniteData({
        roomId: message.roomId,
      });

      const prev = prevPages?.pages[0];
      if (!prev) {
        return;
      }
      const optimisticMessages = [
        {
          createdAt: new Date(Date.now()),
          writer: "server",
          text: "waiting for server to response....",
          roomId: message.roomId,
          messageId: Math.random(),
        },
        {
          createdAt: new Date(Date.now()),
          writer: "you",
          text: message.question,
          roomId: message.roomId,
          messageId: Math.random(),
        },
        ...prev,
      ];

      const updatedPages = { ...prevPages };
      updatedPages.pages[0] = optimisticMessages;

      utils.conversations.infiniteMessage.setInfiniteData(
        { roomId: message.roomId },
        () => updatedPages
      );
      setScrollDown("down");
    },
    onError(err, newMessage, ctx) {
      toast.error("There is some kind of server error");
      setScrollDown("down");
      setIsAsking(false);

      utils.conversations.infiniteMessage.setInfiniteData(
        { roomId: newMessage.roomId },
        (old) => {
          old?.pages[0]?.shift();
          old?.pages[0]?.shift();
          return old;
        }
      );
    },
  });
  /*
   * Infinite fetching of messages from server
   */
  const {
    data: chatPages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.conversations.infiniteMessage.useInfiniteQuery(
    {
      roomId: roomId.current,
    },
    {
      getNextPageParam: (lastPage, allPage) => {
        const lastPageRoomId =
          lastPage.length >= 14
            ? lastPage[lastPage.length - 1]?.messageId
            : undefined;
        return lastPageRoomId;
      },
      staleTime: Infinity,
    }
  );

  /*
   * Intersection Observer
   */

  const intersectionObserver = useRef<IntersectionObserver>();

  const lastMessage = useCallback(
    (message: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (intersectionObserver.current)
        intersectionObserver.current.disconnect();
      intersectionObserver.current = new IntersectionObserver((messages) => {
        if (messages[0]?.isIntersecting && hasNextPage) {
          void fetchNextPage();
        }
      });
      if (message) intersectionObserver.current.observe(message);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );
  const [question, setQuestion] = useState("");
  /*
   * In first load put page down to first message
   */

  useLayoutEffect(() => {
    if (chatPages?.pages.length === 1) {
      lastDiv.current?.scrollIntoView({ inline: "nearest" });
    }
  }, [chatPages]);
  useEffect(() => {
    if (scrollDown === "down") {
      const timeout = setTimeout(() => {
        lastDiv.current?.scrollIntoView({
          behavior: "smooth",
        });
        setScrollDown("not-down");
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [scrollDown]);

  useEffect(() => {
    console.log(hasNextPage);
    if (hasNextPage) {
      const onScroll = (e: Event) => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const maxScrollTop = 200;

        if (scrollTop < maxScrollTop) {
          window.scrollTo(0, maxScrollTop);
        }
      };
      addEventListener("scroll", onScroll);
      return () => {
        removeEventListener("scroll", onScroll);
      };
    }
  }, [hasNextPage]);

  if (isLoading) {
    return <Loading hidden />;
  }
  /*
   * asking question
   */
  function askQuestion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isAsking) {
      toast.error("Wait For Previous Answer To Come");
      return;
    }
    askQuestionInput.current?.blur();
    mutate({
      roomId: roomId.current,
      question: question,
    });
    setQuestion("");
    setIsAsking(true);
  }
  return (
    <div className="m-auto  max-w-[800px] ">
      <div>
        {JSON.stringify(chatPages?.pages[0]) === "[]" && (
          <div className="flex h-[85vh] items-center justify-center text-lg font-bold text-blue-500 ">
            No Conversation Yet
          </div>
        )}
      </div>
      {isFetchingNextPage && (
        <>
          <Loading />
        </>
      )}{" "}
      {JSON.stringify(chatPages?.pages[0]) !== "[]" && (
        <div className="flex min-h-[85vh] flex-col-reverse">
          {chatPages?.pages?.map((messages, indexOfPage) => {
            return messages.map((message, index) => {
              if (
                Math.min(messages.length, 6) === index + 1 &&
                chatPages.pages.length === indexOfPage + 1
              ) {
                return (
                  <Messages
                    key={message.messageId}
                    message={message}
                    ref={lastMessage}
                  />
                );
              }
              return <Messages key={message.messageId} message={message} />;
            });
          })}
        </div>
      )}
      <div ref={lastDiv} className=""></div>
      <form
        onSubmit={askQuestion}
        className="sticky bottom-0  flex w-[100%] justify-center gap-2 bg-white "
      >
        <input
          ref={askQuestionInput}
          placeholder="Write Your question"
          className="my-1 grow-[2] rounded border-2 p-2 focus:outline-none md:m-2 "
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <button className={`my-1 grow-[1] rounded bg-blue-300 md:m-2 `}>
          {isAsking ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
