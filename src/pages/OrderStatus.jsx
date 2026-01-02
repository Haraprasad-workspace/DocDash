import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { listenToOrder } from "../lib/orders";

const STATUS_LABELS = {
  pending: "Waiting in queue",
  printing: "Printing in progress",
  ready: "Ready for pickup",
  completed: "Completed",
  failed: "Order failed",
};

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = listenToOrder(orderId, setOrder);

    return () => unsubscribe();
  }, [orderId]);

  if (!order) {
    return <main className='flex-1'>Loading order…</main>;
  }

  return (
    <main className='flex-1 p-4'>
      <h2>Order Status</h2>

      <p>
        <strong>Order ID:</strong> {order.id}
      </p>
      <p>
        <strong>Status:</strong> {STATUS_LABELS[order.status]}
      </p>
      <p>
        <strong>Total Pages:</strong> {order.totalPages}
      </p>
      <p>
        <strong>Total Price:</strong> ₹{order.totalPrice}
      </p>

      <h3 className='mt-4'>Files</h3>
      {order.files.length === 0 && <p>No files attached yet</p>}

      <ul>
        {order.files.map((file, idx) => (
          <li key={idx}>
            <a href={file.url} target='_blank'>
              {file.name}
            </a>{" "}
            ({file.pages} pages)
          </li>
        ))}
      </ul>
    </main>
  );
};

export default OrderStatus;
