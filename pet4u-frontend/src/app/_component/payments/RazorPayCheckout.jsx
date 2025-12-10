'use client';

import { useEffect, useState } from 'react';
import { paymentAPI } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RazorpayCheckout({ 
  amount, 
  petId, 
  petName,
  paymentType = 'adoption_fee',
  description,
  onSuccess,
  onError,
  children 
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create order
      const orderResponse = await paymentAPI.createPaymentOrder({
        amount,
        petId,
        paymentType,
        description: description || `Payment for ${petName}`,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const { orderId, amount: orderAmount, currency, keyId } = orderResponse.data.data;

      // Razorpay options
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'PET4U',
        description: description || `Adoption fee for ${petName}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              toast.success('Payment successful!');
              if (onSuccess) {
                onSuccess(verifyResponse.data.data.payment);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
            if (onError) {
              onError(error);
            }
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
      if (onError) {
        onError(error);
      }
    }
  };

  if (children) {
    return (
      <div onClick={handlePayment} style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
        {children}
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount}`
      )}
    </Button>
  );
}
