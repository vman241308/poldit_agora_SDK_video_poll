// import { PubSub } from "@google-cloud/pubsub";
// import configs from "../endpoints.config";
// import pubSubOptions from "../gsCloudOptions";

// const pubsub = new PubSub(pubSubOptions);

// export default pubsub;

// import { GooglePubSub } from '@axelspringer/graphql-google-pubsub';
// import pubSubOptions from "../gsCloudOptions";

// const pubSub = new GooglePubSub(pubSubOptions, topic2SubName, commonMessageHandler)
import Ably from "ably";
import { PubSubEngine } from "graphql-subscriptions";

type SubscriptionInfo = {
  handler: (...args: unknown[]) => void;
  triggerName: string;
};

export default class AblyPubSub extends PubSubEngine {
  private ably: Ably.Realtime;
  private handlerMap: any = new Map<number, SubscriptionInfo>();

  constructor(options: Ably.Types.ClientOptions) {
    super();
    this.ably = new Ably.Realtime(options);
  }

  public async getRoomMembers<T>(channelName: string): Promise<any> {
    const channel = this.ably.channels.get(channelName);
    const members = channel.presence.get()
    console.log({members})
  }

  public async connectToChannel<T>(
    triggerName: string,
    content: any
  ): Promise<any> {
    const channel = this.ably.channels.get(triggerName);
    await channel.attach((err) => {
      if (err) return console.error("Error attaching to channel");
    });

    await channel.presence.enter(content, (err) => {
      if (err) return console.error("Error entering presense set");
      console.log("This client has entered the presense set");
    });

    await channel.presence.subscribe((presenceMssg) => {
      const { action, clientId } = presenceMssg;
      console.log("Presence update:", action, "from:", clientId);

      channel.presence.get((err, members) => {
        if (err) return console.error(`Error retrieving presence data: ${err}`);
        const clientIds = members?.map(({ clientId }) => clientId);
        console.log("The presence set now consists of: ", clientIds);
      });
    });
  }

  public async publish<T>(triggerName: string, payload: T): Promise<void> {
    const channel = this.ably.channels.get(triggerName);
    channel.publish(
      "push",
      payload,
      (err) => err && console.log("ably pub sub error:", err)
    );
  }

  public subscribe(
    triggerName: string,
    onMessage: (...args: unknown[]) => void
  ): Promise<number> {
    const handler = (message: Ably.Types.Message) => {
      onMessage(message.data);
    };

    const id = Date.now() * Math.random();
    this.handlerMap.set(id, { handler, triggerName });

    const channel = this.ably.channels.get(triggerName);
    channel.subscribe("push", handler);

    return Promise.resolve(id);
  }

  public unsubscribe(subId: number) {
    const info = this.handlerMap.get(subId);
    if (!info) {
      return;
    }

    const channel = this.ably.channels.get(info.triggerName);
    channel.unsubscribe("push", info.handler);
    this.handlerMap.delete(subId);
  }
}
