import { useParams, useSearchParams } from "react-router-dom";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "react-razorpay";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createRazorpayPaymentIntentAPI } from "../../apis/razorpayPayment/razorpayPayment";
import StatusMessage from "../Alert/Statusmessage";


const CheckoutForm = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const plan = params.plan;
  const amount = searchParams.get("amount");

  const [errorMessage, setErrorMessage] = useState(null);

  const mutation = useMutation({
    mutationFn: createRazorpayPaymentIntentAPI,
  });

  const handlePayment = async (e) => {
    e.preventDefault();

    const data = {
      amount,
      plan,
    };

    mutation.mutate(data, {
      onSuccess: (res) => {
        const options = {
          key: "REACT_APP_RAZORPAY_KEY_ID ", // ✅ Replace with your Razorpay public key
          amount: res.amount,
          currency: "INR",
          name: "Your Company Name",
          description: `Payment for ${plan} Plan`,
          order_id: res.orderId, // returned from backend
          handler: function (response) {
            // Redirect or verify the payment
            window.location.href = "http://localhost:3000/success";
          },
          prefill: {
            name: "User Name",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#6366f1",
          },
        };

        const razor = new window.Razorpay(options);
        razor.on("payment.failed", function (response) {
          setErrorMessage(response.error.description);
        });

        razor.open();
      },
      onError: (err) => {
        setErrorMessage(err?.response?.data?.error || "Payment initiation failed");
      },
    });
  };

  return (
    <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
      <form
        onSubmit={handlePayment}
        className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md"
      >
        {/* Display loading */}
        {mutation?.isPending && (
          <StatusMessage type="loading" message="Processing, please wait..." />
        )}

        {/* Display error */}
        {mutation?.isError && (
          <StatusMessage
            type="error"
            message={mutation?.error?.response?.data?.error}
          />
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Pay with Razorpay
        </button>

        {errorMessage && (
          <div className="text-red-500 mt-4">{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
