import { NatsConnection, StringCodec, Subscription } from "nats";
import { saveStroke } from "../../domain/usecases/saveStroke.js";
import { deleteStroke } from "../../domain/usecases/deleteStroke.js";
import { StrokeRepository } from "../../domain/repositories/StrokeRepository.js";
import { Stroke } from "../../domain/entities/Stroke.js";

export function startNats(
  nc: NatsConnection,
  sc: ReturnType<typeof StringCodec>,
  strokeRepo: StrokeRepository
): void {
  console.log("NATS listeners started");

  // DRAW
  const drawSub: Subscription = nc.subscribe("room.*.draw");

  (async () => {
    for await (const msg of drawSub) {
      const stroke = JSON.parse(sc.decode(msg.data)) as Stroke;
      const roomId = msg.subject.split(".")[1];

      await saveStroke(strokeRepo, roomId, stroke);
      console.log("Saved stroke", stroke.strokeId);
    }
  })();

  // ERASE
  const eraseSub: Subscription = nc.subscribe("room.*.erase");

  (async () => {
    for await (const msg of eraseSub) {
      const data = JSON.parse(sc.decode(msg.data)) as { strokeId: string };
      const roomId = msg.subject.split(".")[1];

      await deleteStroke(strokeRepo, roomId, data.strokeId);
      console.log("Deleted stroke", data.strokeId);
    }
  })();
}
