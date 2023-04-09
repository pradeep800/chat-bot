import Image from "next/image";
import { Message } from "@prisma/client";
import robotPhoto from "~/images/robot.png";
import { forwardRef } from "react";
import { useInfo } from "~/utils/userInfoStore";

const Messages = forwardRef<HTMLDivElement, { message: Message }>(
  ({ message }, ref) => {
    const profilePhoto = useInfo((state) => state.userInfo).profilePhoto;
    const messageComponent = (
      <div className="m-2 rounded border-2 p-3">
        <div className="flex gap-2">
          {message.writer === "you" ? (
            <Image
              className="rounded-full"
              alt="your photo"
              src={profilePhoto}
              width={30}
              height={30}
            />
          ) : (
            <Image src={robotPhoto} alt="robot" width={30} height={30} />
          )}

          <div>{message.writer}</div>
        </div>

        <div>{message.text}</div>
      </div>
    );
    return ref ? (
      <div ref={ref}>{messageComponent}</div>
    ) : (
      <>{messageComponent}</>
    );
  }
);

Messages.displayName = "Messages";

export default Messages;
